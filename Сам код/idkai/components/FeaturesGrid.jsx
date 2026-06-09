import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Brain, Globe, Zap, Database, BarChart, Smartphone, Shield, Search, Layers } from 'lucide-react';
// список фич для сетки — просто иконка + пара строк текста
const features = [
  { icon: MessageCircle, title: "24/7 Поддержка", desc: "Мгновенные ответы" },
  { icon: Brain, title: "Контекст", desc: "Помнит историю диалога" },
  { icon: Database, title: "База Знаний", desc: "Обучение на ваших PDF" },
  { icon: Globe, title: "95 Языков", desc: "Мультиязычность" },
  { icon: Zap, title: "AI Продажи", desc: "Квалификация лидов" },
  { icon: Smartphone, title: "Омниканальность", desc: "Web, Insta, API" },
  { icon: BarChart, title: "Аналитика", desc: "Дашборд диалогов" },
  { icon: Shield, title: "Безопасность", desc: "Защита данных" },
  { icon: Layers, title: "Batch Mode", desc: "Много задач сразу" },
  { icon: Search, title: "SEO Оптимизация", desc: "Ответы под алгоритмы" },
];
export const FeaturesGrid = () => {
  return (
    <section id="функции" className="py-28 px-6 md:px-12 relative">
       <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
             <h2 className="heading-hero text-3xl md:text-5xl mb-4">Полный конвейер автоматизации</h2>
             <p className="text-white/45 text-base md:text-lg max-w-2xl mx-auto">
               10 AI-инструментов в одной программе. От идеи до готового результата —
               всё автоматически.
             </p>
          </div>
          {/* 2 колонки на телефоне, 5 на десктопе */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             {features.map((feature, i) => (
                <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.04 }} // карточки появляются волной, по очереди
                   className="apple-card flex flex-col items-start p-5 group"
                >
                   <div className="w-11 h-11 bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 rounded-xl flex items-center justify-center text-[#EBCB8B] mb-4 group-hover:scale-110 group-hover:bg-[#EBCB8B]/20 transition-all">
                      <feature.icon size={20} strokeWidth={1.5} />
                   </div>
                   <h3 className="font-bold text-white text-sm mb-0.5">{feature.title}</h3>
                   <p className="text-[11px] text-white/40 uppercase tracking-wide">{feature.desc}</p>
                </motion.div>
             ))}
          </div>
       </div>
    </section>
  );
};