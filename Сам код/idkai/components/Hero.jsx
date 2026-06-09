import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Film, Smartphone, Bot, LayoutDashboard, Download, Settings, Image, Sparkles, Clock, ArrowRight } from 'lucide-react';

// первый экран — то, что юзер видит сразу при заходе
export const Hero = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-6 overflow-hidden pt-32 pb-20">
      <div className="z-10 text-center max-w-5xl flex flex-col items-center">

        {/* плашка "AI-POWERED TOOLS" сверху */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] badge-glow mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#EBCB8B] badge-dot"></div> {/* мигающая золотая точка */}
          <span className="text-white/50 text-[13px] font-medium tracking-wider uppercase">
            AI-POWERED TOOLS
          </span>
        </motion.div>

        {/* главный заголовок */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="heading-hero mb-8"
        >
          IDK: Твои личные<br />
          Ai-инструменты
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-6"
        >
          <p className="text-white/70 text-base md:text-lg font-medium mb-2">
            Скачивай видео без водяных знаков. <strong className="text-white">Генерируй промты с ИИ.</strong>
          </p>
          <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto">
            Всё в одном Dashboard. Зарегистрируйся через Google и получи мгновенный доступ.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-white/35 text-sm mb-10 max-w-xl mx-auto"
        >
          TikTok · YouTube Shorts · AI Промты · Без подписки
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col md:flex-row items-center gap-6 mb-20"
        >
          {/* главный CTA — ведёт в регистрацию/дашборд */}
          <button onClick={onGetStarted} className="btn-gold-primary text-base px-10 py-4">
            Начать бесплатно
          </button>
          <span className="text-white/40 text-sm">Free-план сразу · Все обновления</span>
        </motion.div>

        {/* нарисованный макет дашборда — чисто для красоты, не настоящий */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="relative w-full max-w-3xl mx-auto"
        >
          <motion.div
            className="relative bg-[#080808] rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-[#EBCB8B]/5"
            whileHover={{
              y: -4,
              scale: 1.015,
              boxShadow: '0 26px 70px rgba(235,203,139,0.28)',
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* фейковая адресная строка с тремя кружочками как в macOS */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0c0c0c] border-b border-white/[0.06]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
              <span className="text-white/20 text-[10px] font-medium ml-auto">idk-dashboard.app</span>
            </div>
            <div className="flex">
              <div className="w-[180px] bg-[#0c0c0c] border-r border-white/[0.06] hidden md:flex flex-col">
                <div className="px-4 py-4 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#EBCB8B] to-[#D4AF37] flex items-center justify-center text-black font-black text-[7px]">IDK</div>
                  <span className="text-white/70 font-semibold text-[11px]">i don't know</span>
                </div>
                <div className="px-3 flex-1">
                  <div className="text-[9px] text-white/20 font-semibold uppercase tracking-[0.12em] px-2 mb-2">Меню</div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/15 text-[#EBCB8B] text-[11px] font-medium">
                      <LayoutDashboard size={13} strokeWidth={1.5} />Главная
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-white/35 text-[11px]">
                      <Download size={13} strokeWidth={1.5} />Скачать видео
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-white/35 text-[11px]">
                      <Bot size={13} strokeWidth={1.5} />AI Промты
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-white/35 text-[11px]">
                      <Image size={13} strokeWidth={1.5} />Изображения
                    </div>
                  </div>
                  <div className="text-[9px] text-white/20 font-semibold uppercase tracking-[0.12em] px-2 mb-2 mt-5">Прочее</div>
                  <div className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-white/35 text-[11px]">
                    <Settings size={13} strokeWidth={1.5} />Настройки
                  </div>
                </div>
                <div className="px-3 pb-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#EBCB8B]/5 border border-[#EBCB8B]/15 flex items-center justify-center">
                      <span className="text-white/30 text-[9px] font-bold">U</span>
                    </div>
                    <div>
                      <div className="text-white text-[10px] font-medium">User</div>
                      <div className="text-white/25 text-[8px]">Free</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="h-[38px] flex items-center px-5 border-b border-white/[0.06] bg-[#0c0c0c]/80">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gradient-to-br from-[#EBCB8B] to-[#D4AF37]" />
                    <span className="text-white font-semibold text-[11px]">Главная</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <div className="text-white font-bold text-base mb-0.5">Добро пожаловать</div>
                    <div className="text-white/30 text-[10px]">Выберите инструмент для начала работы</div>
                  </div>

                  {/* плитки со статой — цифры тут просто для вида */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {[
                      { icon: Download, label: 'Видео', value: '12', color: 'text-[#EBCB8B]' },
                      { icon: Sparkles, label: 'Промтов', value: '8', color: 'text-[#EBCB8B]' },
                      { icon: Image, label: 'Картинок', value: '5', color: 'text-[#EBCB8B]' },
                      { icon: Clock, label: 'Сессия', value: '24м', color: 'text-[#EBCB8B]' },
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                          <div className="w-6 h-6 rounded-md bg-[#EBCB8B]/10 border border-[#EBCB8B]/15 flex items-center justify-center mb-2">
                            <Icon size={11} className={stat.color} />
                          </div>
                          <div className="text-white font-extrabold text-lg leading-none mb-0.5">{stat.value}</div>
                          <div className="text-white/30 text-[8px] uppercase tracking-wider font-semibold">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { icon: Film, name: 'TikTok', desc: 'Без водяных знаков' },
                      { icon: Smartphone, name: 'Shorts', desc: 'HD качество' },
                      { icon: Bot, name: 'AI Промты', desc: 'Генератор' },
                      { icon: Image, name: 'Картинки', desc: 'Gemini AI' },
                    ].map((tool, i) => {
                      const Icon = tool.icon;
                      return (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 group hover:border-[#EBCB8B]/20 transition-colors">
                          <div className="mb-2">
                            <div className="w-7 h-7 bg-[#EBCB8B]/10 border border-[#EBCB8B]/15 rounded-lg flex items-center justify-center text-[#EBCB8B]">
                              <Icon size={13} />
                            </div>
                          </div>
                          <div className="text-white text-[11px] font-bold mb-0.5">{tool.name}</div>
                          <div className="text-white/30 text-[9px]">{tool.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* размытое золотое свечение позади макета */}
          <div className="pointer-events-none absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[135%] h-[135%] rounded-[40%] bg-gradient-to-tr from-[#EBCB8B]/18 via-transparent to-[#D4AF37]/10 blur-3xl opacity-90"></div>
        </motion.div>
      </div>
    </section>
  );
};
