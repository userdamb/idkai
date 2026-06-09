import { Router } from 'express';
import { spawn } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const router = Router();

const YTDLP_BIN = process.env.YTDLP_BIN || 'yt-dlp'; // путь к бинарю yt-dlp
// из какого браузера тянуть куки ютуба (нужно, чтобы обойти "подтвердите, что вы не бот")
const YTDLP_COOKIES_BROWSER = process.env.YTDLP_COOKIES_BROWSER ?? 'chrome';

// аргументы, общие для всех вызовов yt-dlp
function ytdlpBaseArgs() {
  const args = ['--no-playlist', '--no-warnings', '--no-progress'];
  if (YTDLP_COOKIES_BROWSER) {
    args.push('--cookies-from-browser', YTDLP_COOKIES_BROWSER);
  }
  // прикидываемся клиентами tv/safari — так ютуб реже капризничает
  args.push('--extractor-args', 'youtube:player_client=tv,web_safari');
  return args;
}

// по ссылке угадываем, откуда видео
function detectPlatform(url) {
  const lower = url.toLowerCase();
  if (lower.includes('tiktok.com') || lower.includes('vm.tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  return null; // ничего не распознали
}

// секунды -> "м:сс"
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// тикток дёргаем через бесплатное стороннее апи tikwm (без водяных знаков)
async function fetchTikTok(url) {
  const resp = await fetch('https://www.tikwm.com/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `url=${encodeURIComponent(url)}&hd=1`,
  });
  const json = await resp.json();
  if (json.code !== 0 || !json.data) {
    throw new Error(json.msg || 'TikWM вернул ошибку');
  }
  const d = json.data;
  // если это фото-слайдшоу, а не видео — отдаём картинки
  if (d.images && d.images.length > 0) {
    return {
      platform: 'tiktok',
      title: d.title || 'TikTok Slideshow',
      author: d.author?.nickname || d.author?.unique_id || '@автор',
      thumbnail: d.cover || d.images[0],
      duration: `${d.images.length} фото`,
      downloadUrl: d.images[0],
      images: d.images,
    };
  }
  // обычное видео: play — без вотермарки, hdplay — в HD
  return {
    platform: 'tiktok',
    title: d.title || 'TikTok видео',
    author: d.author?.nickname || d.author?.unique_id || '@автор',
    thumbnail: d.cover || d.origin_cover || '',
    duration: d.duration ? formatDuration(d.duration) : '--:--',
    downloadUrl: d.play || '',
    hdDownloadUrl: d.hdplay || '',
  };
}

// запускаем yt-dlp как дочерний процесс и собираем его вывод
function runYtdlp(args, { json = false } = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP_BIN, args);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => { out += d; }); // копим stdout
    proc.stderr.on('data', (d) => { err += d; }); // и stderr на случай ошибки
    proc.on('error', (e) => {
      // ENOENT = бинаря просто нет в системе
      reject(new Error(e.code === 'ENOENT'
        ? 'yt-dlp не установлен на сервере.'
        : e.message));
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        // ненулевой код = что-то пошло не так, разбираем stderr
        return reject(new Error(friendlyYtError(err)));
      }
      if (!json) return resolve(out);
      try {
        resolve(JSON.parse(out));
      } catch {
        reject(new Error('Не удалось разобрать ответ yt-dlp.'));
      }
    });
  });
}

// превращаем простыню от yt-dlp в понятное юзеру сообщение
function friendlyYtError(stderr) {
  const s = (stderr || '').toLowerCase();
  if (s.includes('confirm you') || s.includes('sign in') || s.includes('cookies')) {
    return 'YouTube требует подтверждения входа. Войдите в YouTube в браузере Chrome на этом компьютере.';
  }
  if (s.includes('private') || s.includes('members-only')) return 'Видео приватное или только для участников.';
  if (s.includes('unavailable') || s.includes('removed')) return 'Видео недоступно или удалено.';
  if (s.includes('age')) return 'Видео с возрастным ограничением.';
  // ничего из известного не нашли — берём первую строку с ERROR
  const firstError = (stderr || '').split('\n').find((l) => l.includes('ERROR'));
  return firstError ? firstError.replace(/^ERROR:\s*/, '').trim() : 'Не удалось получить видео с YouTube.';
}

// ютуб: сначала просто спрашиваем метаданные (-J отдаёт json)
async function fetchYouTube(url) {
  const info = await runYtdlp([...ytdlpBaseArgs(), '-J', url], { json: true });
  return {
    platform: 'youtube',
    title: info.title || 'YouTube видео',
    author: info.uploader || info.channel || 'YouTube',
    thumbnail: info.thumbnail || '',
    duration: typeof info.duration === 'number' ? formatDuration(info.duration) : '--:--',
    // помечаем спец-префиксом: само скачивание будет в /download/file через yt-dlp
    downloadUrl: `ytdlp:${url}`,
  };
}

// главная ручка: по ссылке вернуть инфу о видео
router.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url_required' });
  }
  const platform = detectPlatform(url.trim());
  if (!platform) {
    return res.status(400).json({ error: 'unsupported_platform' }); // не тикток и не ютуб
  }
  try {
    // в зависимости от площадки идём своим путём
    const result = platform === 'tiktok'
      ? await fetchTikTok(url.trim())
      : await fetchYouTube(url.trim());
    return res.json(result);
  } catch (err) {
    console.error('[download] failed:', err?.message || err);
    return res.status(502).json({ error: err.message || 'download_failed' });
  }
});

// отдаём сам файл: гоняем его через себя, чтобы браузер скачал, а не открыл в новой вкладке
router.get('/download/file', async (req, res) => {
  const { url, filename } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url_required' });
  }
  // чистим имя файла от всякой дичи, чтобы не сломать заголовок
  const safeName = String(filename || 'video.mp4').replace(/[^\p{L}\p{N}.\-_ ]/gu, '_');

  // ветка для ютуба: качаем и склеиваем видео+звук через yt-dlp во временную папку
  if (url.startsWith('ytdlp:')) {
    const target = url.slice('ytdlp:'.length);
    let dir;
    try {
      dir = await mkdtemp(path.join(os.tmpdir(), 'idkdl-')); // своя временная папка под каждое скачивание
      const outTpl = path.join(dir, 'video.%(ext)s');
      await runYtdlp([
        ...ytdlpBaseArgs(),
        // берём лучшее видео до 1080p + аудио, с запасными вариантами через /
        '-f', 'bv*[height<=1080][ext=mp4]+ba[ext=m4a]/bv*[height<=1080]+ba/b',
        '--merge-output-format', 'mp4',
        '-o', outTpl,
        target,
      ]);
      // расширение заранее не знаем, поэтому ищем файл по префиксу
      const files = await readdir(dir);
      const file = files.find((f) => f.startsWith('video.'));
      if (!file) throw new Error('Файл не создан.');
      const fullPath = path.join(dir, file);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      const stream = createReadStream(fullPath);
      stream.pipe(res);
      // в любом случае подчищаем за собой временную папку
      const cleanup = () => rm(dir, { recursive: true, force: true }).catch(() => {});
      stream.on('close', cleanup);
      stream.on('error', () => { cleanup(); if (!res.headersSent) res.status(502).end(); });
    } catch (err) {
      if (dir) rm(dir, { recursive: true, force: true }).catch(() => {}); // прибираемся даже при ошибке
      console.error('[download/file ytdlp] failed:', err?.message || err);
      if (!res.headersSent) res.status(502).json({ error: err.message || 'stream_failed' });
    }
    return;
  }

  // ветка для тиктока: просто проксируем готовый файл по прямой ссылке
  try {
    const upstream = await fetch(url, {
      // притворяемся браузером + Referer тиктока, иначе могут не отдать
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.tiktok.com/' },
    });
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ error: 'upstream_error' });
    }
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    const len = upstream.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len); // если знаем размер — отдадим, чтобы был прогресс-бар
    // льём ответ кусками, чтобы не держать весь файл в памяти
    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    console.error('[download/file] failed:', err?.message || err);
    if (!res.headersSent) res.status(502).json({ error: 'stream_failed' });
  }
});

export default router;
