import React from 'react';
import { motion } from 'framer-motion';
import { Check, UserPlus, Sparkles as SparklesIcon, Download, Sparkles, Zap, Shield, RefreshCw } from 'lucide-react';

// блок "как это работает" — 4 шага от регистрации до использования
export const SmartCloneSection = () => {
  // шаги онбординга, рисуем их таймлайном с вертикальной линией
  const steps = [
    {
      id: 1,
      icon: UserPlus,
      title: "Зарегистрируйся через Google",
      desc: "Войди через Google за пару секунд — аккаунт с бесплатным планом создаётся автоматически.",
    },
    {
      id: 2,
      icon: SparklesIcon,
      title: "Открой Dashboard",
      desc: "Сразу получи доступ ко всем инструментам платформы. Платные тарифы оформляются на сайте.",
    },
    {
      id: 3,
      icon: Download,
      title: "Скачивай видео без водяных знаков",
      desc: "TikTok, YouTube Shorts — вставь ссылку и скачай видео в HD качестве за секунды.",
    },
    {
      id: 4,
      icon: Sparkles,
      title: "Генерируй контент с AI",
      desc: "Промты, изображения, идеи для контента — всё доступно прямо в Dashboard.",
    },
  ];

  return (
    <section id="технология" className="py-28 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* левая колонка: текст, выезжает слева при скролле */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#EBCB8B]/20 bg-[#EBCB8B]/5 backdrop-blur-sm mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EBCB8B]"></div>
            <span className="text-[#EBCB8B] text-[10px] md:text-xs font-bold tracking-widest uppercase">
              Как это работает
            </span>
          </div>
          <h2 className="heading-hero text-4xl md:text-[3.5rem] leading-tight mb-8">
            Просто начни.<br />
            <span className="text-gradient-gold">Результат мгновенно.</span>
          </h2>
          <p className="text-white/55 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
            IDK — это набор AI-инструментов в одном Dashboard.
            Скачивай видео, генерируй промты и создавай изображения.
            Всего 4 шага до полного доступа.
          </p>
          <ul className="space-y-4 mb-10">
            {[
              { icon: Shield, text: "Без водяных знаков и ограничений" },
              { icon: Zap, text: "AI-генерация за секунды" },
              { icon: RefreshCw, text: "Бесплатный план сразу, без подписки" },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#EBCB8B]/10 border border-[#EBCB8B]/15 flex items-center justify-center">
                  <item.icon size={12} className="text-[#EBCB8B]" />
                </div>
                <span className="text-white/70 text-sm font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="apple-card p-8 md:p-10"
        >
          {/* правая колонка: сами шаги */}
          <div className="relative space-y-6">
            {/* вертикальная линия, соединяющая иконки шагов */}
            <div className="absolute left-5 top-8 bottom-20 w-px bg-gradient-to-b from-[#EBCB8B]/30 via-[#EBCB8B]/10 to-transparent z-0"></div>

            {steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative z-10 flex gap-5 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0a0a0a] border border-[#EBCB8B]/25 flex items-center justify-center shadow-[0_0_12px_rgba(235,203,139,0.08)] group-hover:border-[#EBCB8B]/50 group-hover:shadow-[0_0_16px_rgba(235,203,139,0.15)] transition-all duration-300">
                    <StepIcon size={16} className="text-[#EBCB8B]" strokeWidth={1.5} />
                  </div>
                  <div className="pt-0.5 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#EBCB8B]/40 text-[10px] font-bold tabular-nums">0{step.id}</span>
                      <h3 className="text-white font-bold text-sm">{step.title}</h3>
                    </div>
                    <p className="text-white/40 text-[13px] leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* финальный шаг "Готово!" — золотая галочка вместо номера */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative z-10 flex gap-5"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#EBCB8B] to-[#D4AF37] flex items-center justify-center shadow-[0_0_20px_rgba(235,203,139,0.25)]">
                <Check size={18} className="text-black" strokeWidth={2.5} />
              </div>
              <div className="pt-0.5">
                <h3 className="text-white font-bold text-sm">Готово!</h3>
                <p className="text-white/40 text-[13px]">Все инструменты в твоём распоряжении</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="relative z-10 mt-2"
            >
              <div className="rounded-xl bg-[#EBCB8B]/[0.06] border border-[#EBCB8B]/15 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Zap size={14} className="text-[#EBCB8B]" />
                  <span className="text-[#EBCB8B] font-bold text-xs uppercase tracking-wider">Вечный доступ</span>
                </div>
                <span className="text-white/25 text-[11px] font-medium">Купи один раз — пользуйся всегда</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
