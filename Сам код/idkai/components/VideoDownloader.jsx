import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Link2, Loader2, AlertCircle, Video,
  Trash2, Clock, FileVideo, Image, Music, Play, ArrowRight
} from 'lucide-react';
import { apiResolveDownload, downloadFileUrl } from '../services/api.js';
// настройки внешнего вида под каждую площадку (цвета, иконка, по каким кускам ссылки опознаём)
const PLATFORM_CONFIG = {
  tiktok: {
    name: 'TikTok',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    iconComponent: Music,
    patterns: ['tiktok.com', 'vm.tiktok.com'],
  },
  youtube: {
    name: 'YouTube Shorts',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    iconComponent: Play,
    patterns: ['youtube.com/shorts', 'youtu.be'],
  }
};
// быстрая проверка на клиенте, откуда ссылка (чтобы зря не дёргать сервер)
function detectPlatform(url) {
  const lower = url.toLowerCase();
  if (PLATFORM_CONFIG.tiktok.patterns.some(p => lower.includes(p))) return 'tiktok';
  if (PLATFORM_CONFIG.youtube.patterns.some(p => lower.includes(p))) return 'youtube';
  return null;
}
export const VideoDownloader = () => {
  const [url, setUrl] = useState(''); // что в поле ввода
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // список скачанных/скачиваемых видео
  const isLoading = history.some(h => h.status === 'loading'); // хоть одно ещё грузится?
  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Вставьте ссылку на видео');
      return;
    }
    const platform = detectPlatform(trimmed);
    if (!platform) {
      setError('Поддерживаются только TikTok и YouTube Shorts');
      return;
    }
    setError('');
    // сразу добавляем карточку-заглушку со спиннером, пока сервер думает
    const newItem = {
      id: Date.now().toString(),
      platform,
      title: 'Загрузка видео...',
      thumbnail: '',
      duration: '--:--',
      author: '...',
      status: 'loading',
    };
    setHistory(prev => [newItem, ...prev]); // новые сверху
    setUrl(''); // чистим поле, чтобы можно было сразу кинуть следующую ссылку
    let result;
    try {
      const data = await apiResolveDownload(trimmed);
      result = { ...data, status: 'ready' };
      // ведём счётчик скачанных видео для статы в дашборде
      const current = parseInt(localStorage.getItem('idk_video_count') || '0', 10);
      localStorage.setItem('idk_video_count', (current + 1).toString());
    } catch (err) {
      result = {
        status: 'error',
        errorMessage: err.message || 'Ошибка загрузки',
        title: 'Ошибка',
        author: '',
        duration: '',
      };
    }
    // заменяем заглушку реальными данными (или ошибкой) по её id
    setHistory(prev => prev.map(item =>
      item.id === newItem.id
        ? { ...item, ...result }
        : item
    ));
  };
  // запускаем скачивание файла через невидимую ссылку-якорь
  const triggerDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = downloadFileUrl(url, filename);
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click(); // программно кликаем
    document.body.removeChild(a); // и сразу убираем за собой
  };
  // удалить одну карточку из истории
  const removeItem = (id) => {
    setHistory(prev => prev.filter(i => i.id !== id));
  };
  return (
    <div className="max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-end justify-between"
      >
        <div>
          <h2 className="heading-hero text-3xl md:text-4xl mb-2">Скачать видео</h2>
          <p className="text-white/40 text-sm">TikTok и YouTube Shorts без водяных знаков</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" strokeWidth={1.5} />
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDownload(); }}
              placeholder="https://www.tiktok.com/@user/video/..."
              className={`w-full bg-white/[0.03] border ${error ? 'border-red-500/40' : 'border-white/[0.06] focus:border-[#EBCB8B]/30'} rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:bg-white/[0.05]`}
            />
          </div>
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="btn-gold-primary px-6 py-3.5 text-sm flex items-center gap-2 rounded-xl flex-shrink-0 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Скачать
          </button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-red-400 text-xs mt-3 flex items-center gap-1.5 bg-red-500/[0.06] border border-red-500/10 rounded-lg px-3 py-2"
            >
              <AlertCircle size={12} className="flex-shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-white/30" strokeWidth={1.5} />
                <span className="text-white/50 text-xs font-medium uppercase tracking-wider">История загрузок</span>
              </div>
              {history.length > 1 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-white/20 hover:text-red-400 text-xs transition-colors"
                >
                  Очистить
                </button>
              )}
            </div>
            <div className="space-y-3">
              {history.map((item, i) => {
                const cfg = PLATFORM_CONFIG[item.platform];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="group rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 flex items-center gap-4 hover:border-white/[0.1] transition-all duration-300"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      item.platform === 'tiktok' ? 'bg-pink-500/10 border border-pink-500/15' : 'bg-red-500/10 border border-red-500/15'
                    }`}>
                      {/* что показать в превьюшке: спиннер -> картинка -> иконка слайдшоу -> иконка видео */}
                      {item.status === 'loading' ? (
                        <Loader2 size={20} className="text-white/30 animate-spin" />
                      ) : item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : item.images && item.images.length > 0 ? (
                        <Image size={20} className={cfg.color} strokeWidth={1.5} />
                      ) : (
                        <FileVideo size={20} className={cfg.color} strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} uppercase tracking-wider`}>
                          {cfg.name}
                        </span>
                        {item.duration && item.duration !== '--:--' && (
                          <span className="text-white/20 text-[10px]">{item.duration}</span>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium truncate leading-tight">{item.title}</p>
                      <p className="text-white/25 text-xs mt-0.5">{item.author}</p>
                      {item.status === 'error' && item.errorMessage && (
                        <p className="text-red-400/70 text-xs mt-1.5">{item.errorMessage}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status === 'loading' && (
                        <span className="text-[#EBCB8B]/70 text-xs font-medium flex items-center gap-1.5">
                          <Loader2 size={12} className="animate-spin" />
                        </span>
                      )}
                      {/* видео готово — кнопки скачивания (HD отдельно, если тикток дал) */}
                      {item.status === 'ready' && item.downloadUrl && (
                        <div className="flex items-center gap-1.5">
                          {item.hdDownloadUrl && (
                            <button
                              onClick={() => triggerDownload(item.hdDownloadUrl, `${item.platform}_hd_${item.id}.mp4`)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/15 text-[#EBCB8B] text-xs font-bold hover:bg-[#EBCB8B]/20 transition-all"
                            >
                              <Download size={12} strokeWidth={1.5} />
                              HD
                            </button>
                          )}
                          <button
                            onClick={() => triggerDownload(item.downloadUrl, `${item.platform}_${item.id}.mp4`)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/15 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all"
                          >
                            <Download size={12} strokeWidth={1.5} />
                            {item.hdDownloadUrl ? 'SD' : 'Скачать'}
                          </button>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <span className="text-red-400/60 text-xs flex items-center gap-1">
                          <AlertCircle size={12} />
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* пустое состояние, когда ещё ничего не качали */}
      {history.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <Video size={24} className="text-white/10" strokeWidth={1.5} />
          </div>
          <p className="text-white/25 text-sm font-medium mb-1">Нет загрузок</p>
          <p className="text-white/15 text-xs">Вставьте ссылку на видео для начала</p>
        </motion.div>
      )}
    </div>
  );
};
