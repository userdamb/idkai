import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Users, TrendingUp, Quote } from 'lucide-react';

// циферка, которая красиво "докручивается" до нужного значения, когда попадает на экран
const AnimatedCounter = ({ target, suffix = "", duration = 2 }) => {
   const [count, setCount] = useState(0);
   const ref = useRef(null);
   const inView = useInView(ref, { once: true }); // запускаем анимацию только раз, когда увидели элемент

   useEffect(() => {
      if (!inView) return; // ещё не доскроллили — ждём
      const numericTarget = parseInt(target.replace(/[^0-9]/g, '')); // выдираем число из строки
      if (isNaN(numericTarget)) return; // если там не число (например "$$$") — анимировать нечего
      const steps = 60; // за столько шагов докрутим до цели
      const increment = numericTarget / steps;
      let current = 0;
      // тикаем таймером и подкручиваем счётчик
      const timer = setInterval(() => {
         current += increment;
         if (current >= numericTarget) {
            setCount(numericTarget); // дошли до цели — фиксируем ровное число
            clearInterval(timer);
         } else {
            setCount(Math.floor(current));
         }
      }, (duration * 1000) / steps);
      return () => clearInterval(timer); // подчищаем таймер, если компонент исчез
   }, [inView, target, duration]);

   const isNumeric = /\d/.test(target);
   if (!isNumeric) return <span ref={ref}>{target}</span>; // не число — просто выводим как есть

   // красиво сокращаем: 1000000 -> 1M, 50000 -> 50K
   const formatted = count >= 1000000
      ? (count / 1000000).toFixed(count >= 1000000 ? 0 : 1) + 'M'
      : count >= 1000
         ? Math.floor(count / 1000) + 'K'
         : count.toLocaleString('ru-RU');

   return <span ref={ref}>{formatted}{suffix}</span>;
};

// цифры для блока статистики (маркетинговые, не из реальной базы)
const stats = [
   {
      val: "1000000",
      display: "1M",
      suffix: "+",
      label: "Обработанных запросов",
      icon: Zap,
      color: "from-[#EBCB8B] to-[#D4AF37]",
      iconBg: "bg-[#EBCB8B]/10",
      iconColor: "text-[#EBCB8B]",
   },
   {
      val: "50000",
      display: "50K",
      suffix: "+",
      label: "Активных клиентов",
      icon: Users,
      color: "from-blue-400 to-blue-500",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
   },
   {
      val: "$$$",
      suffix: "",
      label: "Доход наших клиентов",
      icon: TrendingUp,
      color: "from-green-400 to-emerald-500",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
   }
];

export const StatsSection = () => {
   return (
      <section className="py-28 px-6 md:px-12 relative overflow-hidden">
         {/* мягкое золотое пятно-подсветка по центру секции */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#EBCB8B]/[0.03] blur-[150px] rounded-full pointer-events-none" />

         <div className="max-w-[1100px] mx-auto relative z-10">
            <div className="text-center mb-16">
               <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-block px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 mb-8"
               >
                  <span className="text-green-400 text-xs font-bold tracking-widest uppercase">
                     Доказанный результат
                  </span>
               </motion.div>

               <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="heading-hero text-4xl md:text-[3.5rem] mb-5 leading-tight"
               >
                  Успех — это не удача.<br />
                  <span className="text-gradient-gold">Это алгоритм.</span>
               </motion.h2>

               <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-base md:text-lg text-white/45 max-w-2xl mx-auto"
               >
                  Используя проверенные структуры автоматизации, вы повышаете конверсию до <strong className="text-white">99%</strong>. Даже без опыта.
               </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 max-w-[900px] mx-auto">
               {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12 }}
                        className="apple-card py-8 md:py-10 px-6 group"
                     >
                        <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-5 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                           <Icon size={20} className={stat.iconColor} />
                        </div>

                        <div className={`text-5xl md:text-6xl font-extrabold mb-2 tracking-tight bg-gradient-to-br ${stat.color} bg-clip-text text-transparent text-center`}>
                           <AnimatedCounter target={stat.val} suffix={stat.suffix} />
                        </div>

                        <div className="text-[11px] tracking-[0.15em] text-white/40 font-semibold uppercase text-center">
                           {stat.label}
                        </div>

                     </motion.div>
                  );
               })}
            </div>

            <motion.div
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="apple-card border-[#EBCB8B]/10 py-6 md:py-7 px-6 md:px-10 relative"
            >
               <div className="absolute top-4 left-6 md:left-8">
                  <Quote size={20} className="text-[#EBCB8B]/15" />
               </div>
               <p className="text-white/55 text-sm md:text-base leading-relaxed text-center pl-0 md:pl-4">
                  <strong className="text-white">Алгоритм уже знает</strong>, какие ответы работают. IDK копирует их ДНК и создаёт новых AI-сотрудников.
                  Ваша задача — <span className="text-[#EBCB8B] font-semibold">просто запустить.</span>
               </p>
            </motion.div>
         </div>
      </section>
   );
};
