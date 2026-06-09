import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Download, Bot, Settings, LogOut,
  Sparkles, Clock, Zap, Camera, User, Loader2, Check,
  ArrowRight, Image as ImageIcon, CircleHelp,
  BookOpen, Mail, CreditCard, Crown, ChevronDown
} from 'lucide-react';
import { VideoDownloader } from './VideoDownloader';
import { AIPromptHelper } from './AIPromptHelper';
import { ImageGenerator } from './ImageGenerator';
import { apiUpdateProfile } from '../services/api';

// основные пункты бокового меню
const menuItems = [
  { id: 'home', label: 'Главная', icon: LayoutDashboard },
  { id: 'video', label: 'Скачать видео', icon: Download },
  { id: 'ai', label: 'AI Промты', icon: Bot },
  { id: 'image', label: 'Изображения', icon: ImageIcon },
];

// нижний блок меню — служебные разделы
const otherItems = [
  { id: 'help', label: 'Помощь', icon: CircleHelp },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

// самодельные иконки тиктока/ютуба (в lucide их нет)
const TikTokIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const YouTubeIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" fill="currentColor" opacity="0.6"/>
  </svg>
);

// красивые подписи тарифов для интерфейса
const TIER_LABELS = { free: 'Free', standard: 'Standard', pro: 'Pro' };

// личный кабинет: слева меню, справа выбранная страница
export const Dashboard = ({ onLogout, onGoHome, account, onUpgrade, onAccountUpdate }) => {
  const [page, setPage] = useState('home'); // какой раздел открыт

  // ник в приоритете, иначе имя из гугла, иначе заглушка
  const displayName = account.nickname || account.name || 'Пользователь';

  // выбираем, какой раздел рендерить в правой части
  const renderPage = () => {
    switch (page) {
      case 'video':
        return <VideoDownloader />;
      case 'ai':
        return <AIPromptHelper />;
      case 'image':
        return <ImageGenerator />;
      case 'help':
        return <HelpPage />;
      case 'settings':
        return <SettingsPage account={account} onUpgrade={onUpgrade} onAccountUpdate={onAccountUpdate} />;
      default:
        return <HomePage onNavigate={setPage} account={account} onUpgrade={onUpgrade} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* левый сайдбар с навигацией */}
      <aside className="w-[250px] bg-[#0c0c0c] border-r border-white/[0.06] flex flex-col flex-shrink-0">
        <button onClick={() => onGoHome?.()} className="h-[60px] flex items-center px-5 gap-3 w-full hover:bg-white/[0.02] transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EBCB8B] to-[#D4AF37] flex items-center justify-center text-black font-black text-[11px] flex-shrink-0 tracking-tight">
            IDK
          </div>
          <span className="text-white/80 font-semibold text-[14px] tracking-[-0.01em]">i don't know</span>
        </button>

        <nav className="flex-1 pt-4 px-3 flex flex-col overflow-y-auto">
          <div className="text-[11px] text-white/25 font-semibold uppercase tracking-[0.12em] px-3 mb-3">
            Меню
          </div>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-[10px] rounded-xl text-[14px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EBCB8B]/10 text-[#EBCB8B] border border-[#EBCB8B]/15'
                      : 'text-white/40 hover:text-white/65 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} className="flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-white/25 font-semibold uppercase tracking-[0.12em] px-3 mb-3 mt-8">
            Прочее
          </div>
          <div className="space-y-1">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-[10px] rounded-xl text-[14px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EBCB8B]/10 text-[#EBCB8B] border border-[#EBCB8B]/15'
                      : 'text-white/40 hover:text-white/65 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} className="flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* карточка юзера внизу сайдбара + кнопка выхода */}
        <div className="px-3 pb-4 border-t border-[#EBCB8B]/10 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBCB8B]/5 border border-[#EBCB8B]/15 flex items-center justify-center overflow-hidden flex-shrink-0">
              {account.avatar ? (
                // no-referrer, иначе гугл иногда отдаёт 403 на свои же аватарки
                <img src={account.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={18} strokeWidth={1.5} className="text-white/25" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[14px] font-medium truncate">{displayName}</p>
              <p className="text-white/30 text-[11px] font-medium">{TIER_LABELS[account.tier] || 'Free'}</p>
            </div>
            <button
              onClick={onLogout}
              className="text-white/15 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04] flex-shrink-0"
              title="Выйти"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* правая часть: шапка с названием раздела + сам контент */}
      <main className="flex-1 overflow-y-auto bg-[#080808]">
        <header className="h-[60px] flex items-center justify-between px-8 border-b border-white/[0.06] bg-[#0c0c0c]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#EBCB8B] to-[#D4AF37]" />
            <h1 className="text-white font-semibold text-[16px] tracking-[-0.01em]">
              {/* заголовок берём из меню по id текущей страницы */}
              {[...menuItems, ...otherItems].find(i => i.id === page)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* mode="wait" — старая страница уезжает, потом приезжает новая */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// стили бейджа тарифа: чем выше тариф — тем золотее
const TIER_BADGE = {
  free: { label: 'Free', cls: 'text-white/60 border-white/15 bg-white/[0.04]' },
  standard: { label: 'Standard', cls: 'text-[#EBCB8B] border-[#EBCB8B]/25 bg-[#EBCB8B]/10' },
  pro: { label: 'Pro', cls: 'text-[#EBCB8B] border-[#EBCB8B]/30 bg-gradient-to-r from-[#EBCB8B]/15 to-[#D4AF37]/10' },
};

// какой тариф предлагать следующим (у pro следующего нет)
const NEXT_TIER = { free: 'standard', standard: 'pro' };

// главная страница дашборда — приветствие, статистика и плитки инструментов
const HomePage = ({ onNavigate, account, onUpgrade }) => {
  // счётчики берём из localStorage (их пополняют другие разделы)
  const [videoCount, setVideoCount] = useState(0);
  const [promptCount, setPromptCount] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState(0); // сколько минут юзер в сессии

  useEffect(() => {
    // подтягиваем счётчики при заходе
    setVideoCount(parseInt(localStorage.getItem('idk_video_count') || '0', 10));
    setPromptCount(parseInt(localStorage.getItem('idk_prompt_count') || '0', 10));
    setImageCount(parseInt(localStorage.getItem('idk_image_count') || '0', 10));

    // засекаем старт сессии один раз (хранится до закрытия вкладки)
    if (!sessionStorage.getItem('idk_session_start')) {
      sessionStorage.setItem('idk_session_start', Date.now().toString());
    }

    // раз в 5 сек обновляем таймер сессии и счётчики (вдруг изменились в другом разделе)
    const interval = setInterval(() => {
      const start = parseInt(sessionStorage.getItem('idk_session_start') || Date.now().toString(), 10);
      setSessionMinutes(Math.floor((Date.now() - start) / 60000));
      setVideoCount(parseInt(localStorage.getItem('idk_video_count') || '0', 10));
      setPromptCount(parseInt(localStorage.getItem('idk_prompt_count') || '0', 10));
      setImageCount(parseInt(localStorage.getItem('idk_image_count') || '0', 10));
    }, 5000);

    return () => clearInterval(interval); // не забываем гасить таймер
  }, []);

  const tools = [
    { icon: TikTokIcon, title: 'TikTok', desc: 'Скачать видео без водяных знаков', page: 'video' },
    { icon: YouTubeIcon, title: 'YouTube Shorts', desc: 'Скачать Shorts в HD качестве', page: 'video' },
    { icon: Bot, title: 'AI Промты', desc: 'Генератор промтов для нейросетей', page: 'ai' },
    { icon: ImageIcon, title: 'Изображения', desc: 'Генерация картинок через AI', page: 'image' },
  ];

  const stats = [
    { icon: Download, label: 'Скачано видео', value: videoCount },
    { icon: Sparkles, label: 'Промтов создано', value: promptCount },
    { icon: ImageIcon, label: 'Изображений', value: imageCount },
    { icon: Clock, label: 'Время сессии', value: sessionMinutes, suffix: ' мин' },
  ];

  const tierBadge = TIER_BADGE[account?.tier] || TIER_BADGE.free;
  const nextTier = NEXT_TIER[account?.tier]; // если есть — покажем кнопку апгрейда
  const firstName = (account?.nickname || account?.name || 'Пользователь').split(' ')[0]; // только имя, без фамилии

  return (
    <div className="max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="apple-card relative overflow-hidden mb-8 p-7 md:p-8 border-[#EBCB8B]/10"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#EBCB8B]/[0.06] blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EBCB8B]/5 border border-[#EBCB8B]/15 flex items-center justify-center overflow-hidden flex-shrink-0">
              {account?.avatar ? (
                <img src={account.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={24} strokeWidth={1.5} className="text-white/30" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h2 className="heading-hero text-2xl md:text-3xl">Привет, {firstName}</h2>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${tierBadge.cls}`}>
                  {tierBadge.label}
                </span>
              </div>
              <p className="text-white/40 text-sm">Выберите инструмент или продолжите работу</p>
            </div>
          </div>
          {/* кнопку апгрейда показываем только если есть куда расти */}
          {nextTier && (
            <button
              onClick={() => onUpgrade?.(nextTier)}
              className="btn-gold-primary px-5 py-3 text-sm flex items-center gap-2 rounded-xl flex-shrink-0 self-start md:self-auto"
            >
              <Crown size={16} />
              Улучшить до {TIER_LABELS[nextTier]}
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="apple-card p-6 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={18} className="text-[#EBCB8B]" />
              </div>
              <div className="text-3xl font-extrabold text-white tabular-nums mb-1">
                {stat.value}{stat.suffix || ''}
              </div>
              <div className="text-[11px] tracking-[0.12em] text-white/40 font-semibold uppercase">
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-5 flex items-center gap-3"
      >
        <h3 className="text-white font-bold text-sm">Инструменты</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#EBCB8B] px-3 py-1 rounded-full border border-[#EBCB8B]/20 bg-[#EBCB8B]/5">
          {tools.length} доступно
        </span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={i}
              onClick={() => onNavigate(tool.page)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="apple-card p-5 text-left transition-all group flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 rounded-xl flex items-center justify-center text-[#EBCB8B] group-hover:scale-110 group-hover:bg-[#EBCB8B]/20 transition-all duration-300 flex-shrink-0">
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-base mb-0.5 group-hover:text-[#EBCB8B] transition-colors">{tool.title}</h4>
                <p className="text-white/40 text-sm truncate">{tool.desc}</p>
              </div>
              <ArrowRight size={18} className="text-white/15 group-hover:text-[#EBCB8B] group-hover:translate-x-1 transition-all flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="apple-card py-6 px-6 md:px-8 border-[#EBCB8B]/10 relative"
      >
        <p className="text-white/50 text-sm leading-relaxed text-center">
          <strong className="text-white">Быстрый старт:</strong> вставьте ссылку на видео из TikTok или YouTube Shorts в раздел «Скачать видео».
          Или используйте <span className="text-[#EBCB8B] font-semibold">AI Промты</span> для генерации промтов под любую нейросеть.
        </p>
      </motion.div>
    </div>
  );
};

// вопросы-ответы для раздела помощи (раскрываются аккордеоном)
const faqItems = [
  {
    q: 'Как получить доступ?',
    a: 'Зарегистрируйтесь на сайте через Google — аккаунт с бесплатным планом Free создаётся автоматически. Никаких ключей вводить не нужно.',
  },
  {
    q: 'Какие тарифы доступны?',
    a: 'Три тарифа: Free (базовые функции, бесплатно), Standard (полный функционал) и Pro (максимум возможностей и приоритетная поддержка).',
  },
  {
    q: 'Как повысить тариф?',
    a: 'Откройте раздел «Цены» на сайте или вкладку «Настройки» в Dashboard и нажмите «Купить» — оплата проходит прямо на сайте, тариф активируется сразу.',
  },
  {
    q: 'Как работает скачивание видео?',
    a: 'Вставьте ссылку на TikTok или YouTube Shorts в раздел «Скачать видео». Видео будет обработано и доступно для скачивания без водяных знаков в HD качестве.',
  },
  {
    q: 'Генерация изображений безлимитная?',
    a: 'Генерация изображений использует модель Gemini AI. Жёстких лимитов нет, но использование основано на честном использовании. Тарифы Standard и Pro получают приоритетный доступ.',
  },
  {
    q: 'Нашёл баг или есть предложение',
    a: 'Мы ценим обратную связь! Напишите нам на hello@idk.ai. Мы активно улучшаем платформу на основе отзывов пользователей.',
  },
];

// страница помощи: шаги старта, фичи и FAQ
const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState(null); // индекс раскрытого вопроса (null = все закрыты)

  const steps = [
    { num: '01', title: 'Зарегистрируйтесь', desc: 'Войдите через Google — план Free сразу на аккаунте' },
    { num: '02', title: 'Откройте Dashboard', desc: 'Все инструменты доступны мгновенно' },
    { num: '03', title: 'Выберите тариф', desc: 'Нужно больше — оплатите Standard или Pro на сайте' },
    { num: '04', title: 'Пользуйтесь', desc: 'Скачивайте видео и генерируйте контент с AI' },
  ];

  return (
    <div className="max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-end justify-between"
      >
        <div>
          <h2 className="heading-hero text-3xl md:text-4xl mb-2">Помощь</h2>
          <p className="text-white/40 text-sm">Всё, что нужно знать о платформе</p>
        </div>
        <a
          href="mailto:hello@idk.ai"
          className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#EBCB8B] px-3 py-1.5 rounded-full border border-[#EBCB8B]/20 bg-[#EBCB8B]/5 hover:bg-[#EBCB8B]/10 transition-all"
        >
          <Mail size={12} />
          Поддержка
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
            <Zap size={13} className="text-[#EBCB8B]" />
          </div>
          <span className="text-white font-bold text-sm">Как начать</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="apple-card p-5 group"
            >
              <span className="text-[#EBCB8B]/30 text-2xl font-black block mb-3">{step.num}</span>
              <p className="text-white font-bold text-sm mb-1">{step.title}</p>
              <p className="text-white/30 text-xs leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
      >
        {[
          { icon: User, title: 'Аккаунт Google', desc: 'Вход в один клик, без паролей и ключей' },
          { icon: Crown, title: 'Тарифы', desc: 'Free сразу, Standard и Pro — оплата на сайте' },
          { icon: Zap, title: 'AI Движок', desc: 'Gemini AI для промтов и изображений' },
        ].map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div key={i} className="apple-card p-5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={16} strokeWidth={1.5} className="text-[#EBCB8B]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-0.5">{feat.title}</p>
                <p className="text-white/35 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mb-6"
      >
        <div className="apple-card overflow-hidden border-[#EBCB8B]/10">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EBCB8B]/15 to-[#D4AF37]/5 border border-[#EBCB8B]/20 flex items-center justify-center">
                <BookOpen size={16} strokeWidth={1.5} className="text-[#EBCB8B]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Частые вопросы</h3>
                <p className="text-white/25 text-[11px]">{faqItems.length} вопросов</p>
              </div>
            </div>
          </div>
          <div>
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i; // раскрыт ли именно этот вопрос
              const isLast = i === faqItems.length - 1; // последнему не рисуем нижнюю разделительную линию
              return (
                <div key={i} className={`${!isLast ? 'border-b border-white/[0.04]' : ''} transition-colors duration-200 ${isOpen ? 'bg-[#EBCB8B]/[0.03]' : 'hover:bg-white/[0.015]'}`}>
                  {/* клик по открытому вопросу закрывает его, по закрытому — открывает */}
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center gap-4 px-6 py-4 text-left"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold tabular-nums transition-all duration-300 ${isOpen ? 'bg-[#EBCB8B]/15 text-[#EBCB8B] border border-[#EBCB8B]/20' : 'bg-white/[0.04] text-white/20 border border-white/[0.06]'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span className={`flex-1 text-sm font-medium transition-colors duration-200 ${isOpen ? 'text-white' : 'text-white/70'}`}>{item.q}</span>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-[#EBCB8B]/10 rotate-180' : 'bg-transparent'}`}>
                      <ChevronDown
                        size={14}
                        strokeWidth={1.5}
                        className={`transition-colors duration-300 ${isOpen ? 'text-[#EBCB8B]' : 'text-white/15'}`}
                      />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pl-[68px]">
                          <div className="w-8 h-px bg-gradient-to-r from-[#EBCB8B]/30 to-transparent mb-3" />
                          <p className="text-white/40 text-sm leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="apple-card p-6 border-[#EBCB8B]/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#EBCB8B]/[0.03] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center flex-shrink-0">
              <Mail size={18} strokeWidth={1.5} className="text-[#EBCB8B]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Нужна помощь?</p>
              <p className="text-white/35 text-xs">Обычно отвечаем в течение нескольких часов</p>
            </div>
          </div>
          <a
            href="mailto:hello@idk.ai"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 text-[#EBCB8B] text-xs font-bold hover:bg-[#EBCB8B]/20 transition-all flex-shrink-0"
          >
            Написать
            <ArrowRight size={14} />
          </a>
        </div>
      </motion.div>
    </div>
  );
};

// что можно докупить с каждого тарифа (на pro — уже потолок)
const UPGRADE_OPTIONS = {
  free: [
    { tier: 'standard', label: 'Standard', price: 14990 },
    { tier: 'pro', label: 'Pro', price: 39990 },
  ],
  standard: [
    { tier: 'pro', label: 'Pro', price: 39990 },
  ],
  pro: [],
};

// страница настроек: профиль, инфа об аккаунте, апгрейд тарифа
const SettingsPage = ({ account, onUpgrade, onAccountUpdate }) => {
  const [editingNickname, setEditingNickname] = useState(false); // режим редактирования ника
  const [nicknameInput, setNicknameInput] = useState(account.nickname || account.name || '');
  const [saving, setSaving] = useState(false);

  // общий хелпер сохранения профиля на сервер
  const updateProfile = async (data) => {
    setSaving(true);
    try {
      const updated = await apiUpdateProfile(account.token, data);
      onAccountUpdate(updated); // прокидываем свежие данные наверх
    } catch {
      // молча проглатываем — на UI просто погаснет "Сохранение..."
    }
    setSaving(false);
  };

  // загрузка аватарки: читаем файл и ужимаем прямо в браузере, чтобы не слать гигабайты
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // сначала читаем файл в data-URL
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result);
      reader.readAsDataURL(file);
    });

    // потом рисуем на канвасе с уменьшением, чтобы сжать
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const MAX = 200; // максимум 200px по большей стороне — для аватарки за глаза
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        // сохраняем пропорции при ресайзе
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.7); // jpeg с качеством 70%
      await updateProfile({ avatar: compressed });
    };
    img.src = dataUrl;
  };

  // сохранить новый ник и выйти из режима редактирования
  const handleNicknameSave = async () => {
    await updateProfile({ nickname: nicknameInput });
    setEditingNickname(false);
  };

  const upgrades = UPGRADE_OPTIONS[account.tier] || []; // доступные апгрейды для текущего тарифа

  return (
    <div className="max-w-2xl">
      <h2 className="heading-hero text-3xl md:text-4xl mb-6">Настройки</h2>

      <div className="space-y-4">
        <div className="apple-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm">Профиль</h3>
            {saving && (
              <span className="text-[#EBCB8B] text-xs flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                Сохранение...
              </span>
            )}
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {account.avatar ? (
                  <img src={account.avatar} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={32} className="text-white/20" />
                )}
              </div>
              {/* при наведении на аватар показываем иконку камеры; сам input спрятан */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
                <Camera size={18} className="text-white/70" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              {editingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleNicknameSave(); }}
                    placeholder="Введите имя"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-[#EBCB8B]/50 flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleNicknameSave}
                    className="px-3 py-2 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 text-[#EBCB8B] text-xs font-bold hover:bg-[#EBCB8B]/20 transition-all"
                  >
                    Сохранить
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-white font-bold text-lg">{account.nickname || account.name || 'Пользователь'}</p>
                  <button
                    onClick={() => { setNicknameInput(account.nickname || account.name || ''); setEditingNickname(true); }}
                    className="text-[#EBCB8B] text-xs hover:underline mt-1"
                  >
                    Изменить имя
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="apple-card p-6">
          <h3 className="text-white font-bold text-sm mb-4">Аккаунт</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">Email</span>
              <span className="text-white/80 text-sm">{account.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">Вход</span>
              <span className="text-white/80 text-sm">Google</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">Тариф</span>
              <span className="text-[#EBCB8B] text-sm font-bold">{TIER_LABELS[account.tier] || 'Free'}</span>
            </div>
          </div>
        </div>

        <div className="apple-card p-6">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Crown size={14} className="text-[#EBCB8B]" />
            Тариф
          </h3>
          {upgrades.length === 0 ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Check size={16} />
              У вас максимальный тариф Pro
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-white/40 text-sm">Текущий тариф: <span className="text-white font-semibold">{TIER_LABELS[account.tier]}</span>. Откройте больше возможностей:</p>
              <div className="flex flex-wrap gap-3">
                {upgrades.map((u) => (
                  <button
                    key={u.tier}
                    onClick={() => onUpgrade(u.tier)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 text-[#EBCB8B] text-sm font-bold hover:bg-[#EBCB8B]/20 transition-all"
                  >
                    <CreditCard size={14} />
                    {u.label} · {u.price.toLocaleString('ru-RU')} ₽
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="apple-card p-6">
          <h3 className="text-white font-bold text-sm mb-4">О приложении</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">Версия</span>
              <span className="text-white/80 text-sm">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">Поддержка</span>
              <a href="mailto:hello@idk.ai" className="text-[#EBCB8B] text-sm hover:underline">
                hello@idk.ai
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
