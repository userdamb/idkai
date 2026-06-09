import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Sparkles, Copy, Check, ChevronRight,
  MessageSquare, Loader2, RefreshCw, AlertCircle,
  ArrowLeft, ArrowRight, Star
} from 'lucide-react';
import { apiGeneratePrompt, apiAiStatus } from '../services/api.js';
// дальше идут самодельные svg-иконки нейросетей — в lucide таких нет, рисуем руками
const IconChatGPTText = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 5h16M4 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5M4 5l2-2h12l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 9h8M8 12h6M8 15h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
    <circle cx="18" cy="4" r="2.5" fill="currentColor" opacity="0.3"/>
  </svg>
);
const IconMidjourney = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="3" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 14l4.5-4 3 2.5 4.5-5 8 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
    <circle cx="8" cy="8.5" r="2" fill="currentColor" opacity="0.35"/>
    <path d="M15 2l1.5 1.5M18.5 2l1 1M21 4.5l1 .5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
  </svg>
);
const IconCode = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="3" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 7h20" stroke="currentColor" strokeWidth="1.3" opacity="0.3"/>
    <path d="M9 11l-2.5 2.5L9 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 11l2.5 2.5L15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 10l-2 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
  </svg>
);
const IconCopywriting = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14 3l-1 1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 3.5l4 4L11 17H7v-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M14.5 5.5l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
  </svg>
);
const IconSuno = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="7" cy="17" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="17" cy="15" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 17V6l10-2v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 10l10-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
  </svg>
);
const IconBrainstorm = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 16v2M10 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 4V2M6.3 6.3L4.9 4.9M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
    <path d="M9.5 10.5l1.5 1.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
  </svg>
);
// каталог шаблонов: для каждого — текст-заготовка с {переменными} и системный промт для Gemini
const templates = [
  {
    id: 'chatgpt-text',
    title: 'ChatGPT — Текст',
    desc: 'Генерация статей, постов и текстов',
    icon: IconChatGPTText,
    color: 'text-green-400',
    bg: 'from-green-500/20 to-emerald-500/20',
    category: 'ChatGPT',
    template: 'Напиши {тип_контента} на тему "{тема}". Стиль: {стиль}. Объём: {длина}. Целевая аудитория: {аудитория}.',
    systemPrompt: `Ты — эксперт по промт-инженерии для ChatGPT. Пользователь хочет сгенерировать текстовый контент.
На основе шаблона и контекста пользователя, создай готовый к использованию промт для ChatGPT.
Промт должен быть на русском, детальным, с чёткими инструкциями по стилю, тону и структуре.
Заполни все переменные в {фигурных скобках} конкретными значениями на основе контекста пользователя.
Если контекст не указан — предложи универсальный пример. Выведи ТОЛЬКО готовый промт без пояснений.`,
  },
  {
    id: 'midjourney',
    title: 'Midjourney — Изображения',
    desc: 'Промты для генерации картинок',
    icon: IconMidjourney,
    color: 'text-purple-400',
    bg: 'from-purple-500/20 to-pink-500/20',
    category: 'Midjourney',
    template: '{описание_объекта}, {стиль_арта}, {освещение}, {качество} --ar {соотношение} --v 6',
    systemPrompt: `Ты — эксперт по промтам для Midjourney. Создавай детальные промты на АНГЛИЙСКОМ языке.
Используй стандартный формат Midjourney: описание, стиль, освещение, качество, параметры (--ar, --v, --s, --q).
На основе контекста пользователя создай готовый промт. Включай: описание сцены, стиль арта (photorealistic, digital art, oil painting и т.д.), освещение (cinematic, soft, dramatic и т.д.), качество (8k, highly detailed и т.д.).
Если контекст не указан — создай красивый пример. Выведи ТОЛЬКО готовый промт без пояснений.`,
  },
  {
    id: 'chatgpt-code',
    title: 'ChatGPT — Код',
    desc: 'Генерация и рефакторинг кода',
    icon: IconCode,
    color: 'text-cyan-400',
    bg: 'from-cyan-500/20 to-blue-500/20',
    category: 'ChatGPT',
    template: 'Напиши {язык} код для {задача}. Требования: {требования}. Используй лучшие практики и добавь комментарии.',
    systemPrompt: `Ты — эксперт по промт-инженерии для генерации кода через ChatGPT.
Создай детальный промт, который заставит ChatGPT написать качественный, чистый код.
Промт должен включать: язык программирования, задачу, входные/выходные данные, требования к качеству, обработку ошибок.
Заполни переменные на основе контекста. Выведи ТОЛЬКО готовый промт без пояснений.`,
  },
  {
    id: 'copywriting',
    title: 'Копирайтинг',
    desc: 'Продающие тексты и рекламные материалы',
    icon: IconCopywriting,
    color: 'text-orange-400',
    bg: 'from-orange-500/20 to-yellow-500/20',
    category: 'ChatGPT',
    template: 'Напиши {формат} для {продукт}. Целевая аудитория: {аудитория}. Тон: {тон}. Включи: заголовок, основной текст, призыв к действию.',
    systemPrompt: `Ты — эксперт по промтам для копирайтинга. Создавай промты для ChatGPT, которые генерируют продающие тексты.
Промт должен включать: формат (пост, лендинг, email), продукт/услугу, целевую аудиторию, тон (дружеский, профессиональный, провокационный), структуру текста (заголовок, буллиты, CTA).
На основе контекста пользователя заполни все переменные. Выведи ТОЛЬКО готовый промт без пояснений.`,
  },
  {
    id: 'suno',
    title: 'Suno — Музыка',
    desc: 'Промты для генерации музыки',
    icon: IconSuno,
    color: 'text-pink-400',
    bg: 'from-pink-500/20 to-rose-500/20',
    category: 'Suno',
    template: '{жанр} track about {тема}, {настроение} mood, {темп} BPM, {инструменты}',
    systemPrompt: `Ты — эксперт по промтам для Suno AI (генерация музыки). Создавай промты на АНГЛИЙСКОМ.
Промт должен включать: жанр (pop, lo-fi, rock, electronic и т.д.), тему/настроение, BPM, инструменты, вокальный стиль.
Используй формат Suno: короткие теги через запятую, стиль и настроение.
На основе контекста пользователя создай готовый промт. Выведи ТОЛЬКО готовый промт без пояснений.`,
  },
  {
    id: 'brainstorm',
    title: 'Brainstorm — Идеи',
    desc: 'Генерация бизнес-идей и стратегий',
    icon: IconBrainstorm,
    color: 'text-yellow-400',
    bg: 'from-yellow-500/20 to-amber-500/20',
    category: 'ChatGPT',
    template: 'Предложи 10 идей для {направление}. Учитывай: бюджет {бюджет}, целевую аудиторию {аудитория}, текущие тренды {год}.',
    systemPrompt: `Ты — эксперт по промтам для брейнштормов через ChatGPT.
Создай промт, который заставит ChatGPT генерировать креативные, уникальные и практичные идеи.
Промт должен включать: область/нишу, ограничения (бюджет, время), целевую аудиторию, формат вывода (нумерованный список с описанием).
На основе контекста пользователя заполни все переменные. Выведи ТОЛЬКО готовый промт без пояснений.`,
  },
];
// собираем сообщение для ИИ: если юзер что-то описал — учитываем, нет — просим универсальный пример
async function generateWithGemini(template, userContext) {
  const userMessage = userContext.trim()
    ? `Шаблон: ${template.template}\n\nКонтекст пользователя: ${userContext}\n\nСоздай готовый промт на основе этого шаблона и контекста.`
    : `Шаблон: ${template.template}\n\nКонтекста нет — создай универсальный пример промта на основе этого шаблона. Заполни все переменные реалистичными примерами.`;
  return apiGeneratePrompt(template.systemPrompt, userMessage);
}
// запасной вариант, когда ИИ недоступен — просто отдаём сам шаблон
function generateFallback(template, userContext) {
  let result = template.template;
  if (userContext.trim()) {
    result = `${template.template}\n\n---\nКонтекст: ${userContext}\n\nАдаптируйте промт выше под указанный контекст перед использованием.`;
  }
  return result;
}
export const AIPromptHelper = () => {
  const [selected, setSelected] = useState(null); // выбранный шаблон (null = показываем список)
  const [userInput, setUserInput] = useState(''); // описание задачи от юзера
  const [generatedPrompt, setGeneratedPrompt] = useState(''); // что вернул ИИ
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false); // показать ли "Скопировано!"
  const [filter, setFilter] = useState('all'); // фильтр по категории
  const [genError, setGenError] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false); // подключён ли ИИ на бэке
  // при монтировании спрашиваем сервер, доступен ли ИИ — от этого зависят подписи кнопок
  React.useEffect(() => {
    apiAiStatus().then((s) => setAiEnabled(s.enabled));
  }, []);
  // 'all' + уникальные категории из шаблонов
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const filtered = filter === 'all' ? templates : templates.filter(t => t.category === filter);
  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    setGenError('');
    try {
      const result = await generateWithGemini(selected, userInput);
      setGeneratedPrompt(result);
      // плюсуем к счётчику сгенерированных промтов (для статы)
      const current = parseInt(localStorage.getItem('idk_prompt_count') || '0', 10);
      localStorage.setItem('idk_prompt_count', (current + 1).toString());
    } catch (err) {
      // ИИ не ответил — не падаем, а показываем шаблон и поясняем почему
      if (err.message === 'gemini_not_configured') {
        setGenError('AI ещё не подключён (нет API-ключа). Показан шаблон.');
      } else {
        setGenError(`AI временно недоступен: ${err.message}. Показан шаблон.`);
      }
      setGeneratedPrompt(generateFallback(selected, userInput));
    }
    setGenerating(false);
  };
  // копируем готовый промт в буфер и на 2 сек подсвечиваем кнопку
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // вернуться к списку шаблонов и всё обнулить
  const handleReset = () => {
    setSelected(null);
    setUserInput('');
    setGeneratedPrompt('');
    setCopied(false);
    setGenError('');
  };
  return (
    <div className="max-w-4xl">
      {/* два экрана: список шаблонов или конструктор выбранного промта */}
      <AnimatePresence mode="wait">
        {!selected ? (
          // ЭКРАН 1 — сетка шаблонов с фильтром по категориям
          <motion.div
            key="templates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 flex items-end justify-between"
            >
              <div>
                <h2 className="heading-hero text-3xl md:text-4xl mb-2">
                  AI Промты
                </h2>
                <p className="text-white/40 text-sm">
                  Генератор промтов для разных нейросетей
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 mb-8 flex-wrap"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    filter === cat
                      ? 'bg-[#EBCB8B]/15 border border-[#EBCB8B]/30 text-[#EBCB8B]'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
                  }`}
                >
                  {cat === 'all' ? 'Все' : cat}
                </button>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((tmpl, i) => {
                const Icon = tmpl.icon;
                return (
                  <motion.button
                    key={tmpl.id}
                    onClick={() => setSelected(tmpl)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="apple-card p-6 text-left group transition-all"
                  >
                    <div className="mb-4">
                      <div className="w-11 h-11 bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 rounded-xl flex items-center justify-center text-[#EBCB8B] group-hover:scale-110 group-hover:bg-[#EBCB8B]/20 transition-all duration-300">
                        <Icon size={20} />
                      </div>
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1 group-hover:text-[#EBCB8B] transition-colors">{tmpl.title}</h4>
                    <p className="text-white/40 text-xs mb-3">{tmpl.desc}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/25">
                      {tmpl.category}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          // ЭКРАН 2 — конструктор: шаблон, поле задачи и результат
          <motion.div
            key="builder"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <button
                onClick={handleReset}
                className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-[#EBCB8B] hover:border-[#EBCB8B]/20 transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 rounded-xl flex items-center justify-center text-[#EBCB8B]">
                  <selected.icon size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.title}</h3>
                  <p className="text-white/35 text-xs">{selected.desc}</p>
                </div>
              </div>
              <span className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#EBCB8B]/5 border border-[#EBCB8B]/20 text-[#EBCB8B]">
                {selected.category}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="apple-card p-6 mb-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
                  <Star size={13} className="text-[#EBCB8B]" />
                </div>
                <span className="text-white font-bold text-sm">Шаблон промта</span>
              </div>
              <p className="text-white/55 text-sm font-mono bg-white/[0.02] rounded-xl p-4 border border-white/[0.06] leading-relaxed">
                {selected.template}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="apple-card p-6 mb-6"
            >
              <label className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
                  <MessageSquare size={13} className="text-[#EBCB8B]" />
                </div>
                <span className="text-white font-bold text-sm">Опишите вашу задачу</span>
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Например: 'Пост для Instagram о здоровом питании для молодых мам' или 'Лендинг для курса по программированию'"
                className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-[#EBCB8B]/40 focus:bg-white/[0.05] rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all resize-none h-28"
              />
              <p className="text-white/20 text-[11px] mt-2.5 tracking-wide">
                {aiEnabled ? 'AI создаст уникальный промт на основе вашего описания' : 'AI не подключён — будет показан шаблон промта'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
            >
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-gold-primary px-8 py-3.5 text-sm flex items-center gap-2.5 rounded-xl mb-6 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Генерирую промт...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {aiEnabled ? 'Сгенерировать с AI' : 'Сгенерировать промт'}
                  </>
                )}
              </button>
            </motion.div>

            {genError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 apple-card p-4 border-yellow-500/15"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-400/70 text-xs leading-relaxed">{genError}</p>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {generatedPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="apple-card p-6 border-[#EBCB8B]/15"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
                        <Bot size={13} className="text-[#EBCB8B]" />
                      </div>
                      <span className="text-white font-bold text-sm">Готовый промт</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/[0.04] text-xs font-medium transition-all disabled:opacity-40"
                      >
                        <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                        Заново
                      </button>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          copied
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 text-[#EBCB8B] hover:bg-[#EBCB8B]/20'
                        }`}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Скопировано!' : 'Копировать'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06]">
                    <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{generatedPrompt}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};