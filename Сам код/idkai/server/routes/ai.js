import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
// плейсхолдер из .env.example за настоящий ключ не считаем
const KEY_CONFIGURED = GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
const ai = KEY_CONFIGURED ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null; // нет ключа — нет ИИ

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

// переводим невнятные ошибки гугла в человеческий текст для юзера
function friendlyError(err) {
  const msg = err?.message || String(err);
  if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
    // частый случай: упёрлись в бесплатный лимит
    return 'Лимит Google AI исчерпан. Для этой модели нужен включённый биллинг в Google Cloud (бесплатный тариф её не покрывает).';
  }
  return msg;
}

// фронт спрашивает, можно ли вообще пользоваться ИИ
router.get('/ai/status', (req, res) => {
  res.json({ enabled: Boolean(ai), imageSupported: true, model: TEXT_MODEL });
});

// генерация текстового промта
router.post('/ai/prompt', async (req, res) => {
  if (!ai) return res.status(503).json({ error: 'gemini_not_configured' });
  const { systemPrompt, userMessage } = req.body;
  if (!userMessage) return res.status(400).json({ error: 'message_required' });
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt || undefined,
        maxOutputTokens: 1024,
        temperature: 0.8, // чуть поднимаем, чтобы ответы были живее
      },
    });
    const text = response.text;
    if (!text) throw new Error('empty_response'); // иногда модель отдаёт пустоту
    return res.json({ text: text.trim() });
  } catch (err) {
    console.error('[ai/prompt] failed:', err?.message || err);
    return res.status(502).json({ error: friendlyError(err) });
  }
});

// генерация картинки — гоняем через бесплатный pollinations.ai
router.post('/ai/image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt_required' });

  // случайный seed, чтобы на один и тот же промт картинки были разные
  const seed = Math.floor(Math.random() * 1_000_000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
    + `?width=1024&height=1024&nologo=true&seed=${seed}`;

  try {
    const upstream = await fetch(url, { headers: { Accept: 'image/*' } });
    if (!upstream.ok) {
      throw new Error(`pollinations ${upstream.status}`);
    }
    const mimeType = upstream.headers.get('content-type') || 'image/jpeg';
    // иногда вместо картинки прилетает html с ошибкой — отсекаем
    if (!mimeType.startsWith('image/')) {
      throw new Error('no_image');
    }
    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.length === 0) throw new Error('no_image');
    // отдаём картинку как base64, чтобы фронт сразу вставил её в <img>
    return res.json({ data: buffer.toString('base64'), mimeType });
  } catch (err) {
    console.error('[ai/image] failed:', err?.message || err);
    return res.status(502).json({
      error: err?.message === 'no_image'
        ? 'Изображение не сгенерировано. Попробуйте другой промт.'
        : 'Сервис генерации изображений временно недоступен. Попробуйте ещё раз.',
    });
  }
});

export default router;
