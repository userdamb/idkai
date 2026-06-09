import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image, Sparkles, Download, Loader2, AlertCircle,
  Camera, Palette, Box, Star, RefreshCw
} from 'lucide-react';
import { apiGenerateImage, apiAiStatus } from '../services/api.js';

// пресеты стилей — каждый просто дописывает "магические слова" в конец промта
const styles = [
  { id: 'photo', label: 'Фото', suffix: ', photorealistic, 8k, highly detailed, professional photography' },
  { id: 'art', label: 'Арт', suffix: ', digital art, vibrant colors, artistic, trending on artstation' },
  { id: '3d', label: '3D', suffix: ', 3D render, octane render, volumetric lighting, cinema 4d' },
  { id: 'anime', label: 'Аниме', suffix: ', anime style, manga art, Japanese illustration, Studio Ghibli' },
  { id: 'logo', label: 'Логотип', suffix: ', minimalist logo design, vector style, clean background, flat design' },
];

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState(''); // что хочет нарисовать юзер
  const [selectedStyle, setSelectedStyle] = useState(null); // выбранный пресет стиля (или null)
  const [generating, setGenerating] = useState(false);
  const [imageData, setImageData] = useState(null); // готовая картинка (base64 + mime)
  const [error, setError] = useState('');
  const [imageSupported, setImageSupported] = useState(true); // умеет ли провайдер в картинки
  // спрашиваем у сервера, поддерживается ли генерация изображений
  React.useEffect(() => {
    apiAiStatus().then((s) => setImageSupported(s.imageSupported !== false));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError('');
    setImageData(null);

    // приклеиваем суффикс выбранного стиля к промту
    const styleSuffix = selectedStyle
      ? styles.find(s => s.id === selectedStyle)?.suffix || ''
      : '';
    const fullPrompt = `Generate an image: ${prompt.trim()}${styleSuffix}`;

    try {
      const result = await apiGenerateImage(fullPrompt);
      setImageData(result);
      // плюсуем счётчик картинок для статы в дашборде
      const current = parseInt(localStorage.getItem('idk_image_count') || '0', 10);
      localStorage.setItem('idk_image_count', (current + 1).toString());
    } catch (err) {
      setError(
        err.message === 'gemini_not_configured'
          ? 'AI ещё не подключён — нет Gemini API-ключа.'
          : err.message || 'Ошибка генерации изображения'
      );
    }
    setGenerating(false);
  };

  // скачиваем картинку: data-ссылку на base64 вешаем на якорь и кликаем
  const handleDownload = () => {
    if (!imageData) return;
    const ext = imageData.mimeType.includes('png') ? 'png' : 'jpg'; // угадываем расширение по mime
    const link = document.createElement('a');
    link.href = `data:${imageData.mimeType};base64,${imageData.data}`;
    link.download = `idk-image-${Date.now()}.${ext}`;
    link.click();
  };

  // сброс — начать с чистого листа
  const handleReset = () => {
    setImageData(null);
    setError('');
    setPrompt('');
    setSelectedStyle(null);
  };

  return (
    <div className="max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-end justify-between"
      >
        <div>
          <h2 className="heading-hero text-3xl md:text-4xl mb-2">
            Изображения
          </h2>
          <p className="text-white/40 text-sm">
            Генерация картинок с помощью AI
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="apple-card p-6 mb-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
            <Camera size={13} className="text-[#EBCB8B]" />
          </div>
          <span className="text-white font-bold text-sm">Опишите изображение</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Например: 'Котёнок в космосе среди звёзд' или 'Закат над горами в стиле импрессионизм'"
          className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-[#EBCB8B]/40 focus:bg-white/[0.05] rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all resize-none h-28"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
            <Palette size={13} className="text-[#EBCB8B]" />
          </div>
          <span className="text-white font-bold text-sm">Стиль</span>
          <span className="text-white/20 text-xs ml-1">(опционально)</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedStyle === style.id
                  ? 'bg-[#EBCB8B]/15 border border-[#EBCB8B]/30 text-[#EBCB8B]'
                  : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="flex flex-wrap items-center gap-3 mb-8"
      >
        {!imageSupported && (
          <span className="w-full text-yellow-400/70 text-xs flex items-center gap-1.5">
            <AlertCircle size={12} /> Текущий AI-провайдер предоставляет только текстовые модели — генерация изображений недоступна.
          </span>
        )}
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim() || !imageSupported}
          className="btn-gold-primary px-8 py-3.5 text-sm flex items-center gap-2.5 rounded-xl disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Генерирую...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Сгенерировать
            </>
          )}
        </button>
        {imageData && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-white/35 hover:text-white/60 hover:bg-white/[0.04] text-sm font-medium transition-all border border-white/[0.06]"
          >
            <RefreshCw size={14} />
            Заново
          </button>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 apple-card p-4 border-red-500/15"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400/70 text-xs leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}

      {/* область результата: спиннер -> готовая картинка -> пустая заглушка */}
      <AnimatePresence>
        {generating && !imageData && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="apple-card p-12 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center mb-5">
              <Loader2 size={28} className="text-[#EBCB8B] animate-spin" />
            </div>
            <p className="text-white/60 text-sm font-medium mb-1">Генерирую изображение...</p>
            <p className="text-white/25 text-xs">Это может занять 10-30 секунд</p>
          </motion.div>
        )}

        {imageData && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="apple-card p-6 border-[#EBCB8B]/15"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
                  <Image size={13} className="text-[#EBCB8B]" />
                </div>
                <span className="text-white font-bold text-sm">Результат</span>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 text-[#EBCB8B] hover:bg-[#EBCB8B]/20 transition-all"
              >
                <Download size={12} />
                Скачать
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
              <img
                src={`data:${imageData.mimeType};base64,${imageData.data}`}
                alt="Generated"
                className="w-full h-auto max-h-[600px] object-contain"
              />
            </div>
          </motion.div>
        )}

        {!generating && !imageData && !error && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="apple-card p-12 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center mb-5">
              <Image size={28} className="text-[#EBCB8B]/40" />
            </div>
            <p className="text-white/40 text-sm font-medium mb-1">Опишите что хотите сгенерировать</p>
            <p className="text-white/20 text-xs">Выберите стиль и нажмите «Сгенерировать»</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
