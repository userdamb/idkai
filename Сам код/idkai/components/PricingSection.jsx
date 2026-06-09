import React from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Lock, RefreshCw, Flame, Clock } from 'lucide-react';
// общий список фич — у каждого тарифа галочками отмечаем, что входит
const allFeatures = [
   "Генерация названия",
   "Генерация описания",
   "Генератор аватарок",
   "Название канала",
   "Генерация фото (AI)",
   "Приоритетная поддержка",
   "Индивидуальная настройка",
];
// индексы фич из allFeatures, которые доступны на каждом тарифе
const freeIncluded = new Set([0, 1, 2, 3]);
const standardIncluded = new Set([0, 1, 2, 3, 4]);
const proIncluded = new Set([0, 1, 2, 3, 4, 5, 6]); // про = всё
const plans = [
   {
      name: "Free",
      tier: "free",
      subtitle: "Для старта канала",
      price: 0,
      oldPrice: null,
      discount: null,
      badge: "БЕСПЛАТНО",
      badgeStyle: "bg-green-500/20 text-green-400 border border-green-500/30",
      included: freeIncluded,
      btnText: "Начать бесплатно",
      highlight: false,
      remaining: null,
      maxSlots: null,
   },
   {
      name: "Standard",
      tier: "standard",
      subtitle: "Полный функционал",
      price: 14990,
      oldPrice: 24990,
      discount: "-40%",
      badge: "ПОПУЛЯРНЫЙ ВЫБОР",
      badgeStyle: "bg-[#EBCB8B]/10 text-[#EBCB8B] border border-[#EBCB8B]/40",
      included: standardIncluded,
      btnText: "Купить Standard",
      highlight: true,
      remaining: 15,
      maxSlots: 50,
   },
   {
      name: "PRO",
      tier: "pro",
      subtitle: "Максимум возможностей",
      price: 39990,
      oldPrice: 49990,
      discount: "-20%",
      badge: "ОСТАЛОСЬ МАЛО",
      badgeStyle: "bg-red-500/20 text-red-400 border border-red-500/30",
      included: proIncluded,
      btnText: "Купить PRO",
      highlight: false,
      remaining: 3,
      maxSlots: 15,
   }
];

// порядок тарифов по "крутости" — чтобы понять, что у юзера уже включено
const TIER_ORDER = { free: 0, standard: 1, pro: 2 };
export const PricingSection = ({ onSelectPlan, account }) => {
   const currentTier = account?.tier || null; // на каком тарифе юзер сейчас (если залогинен)
   return (
      <section id="цены" className="py-28 px-6 md:px-12 bg-[#050505]">
         <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-14">
               <h2 className="heading-hero text-3xl md:text-5xl mb-6">Выбери свой тариф</h2>
               <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03]">
                  <span className="text-white/50 text-sm">Предзаказ закрывается через</span>
                  <span className="text-[#EBCB8B] font-bold text-sm">6 дней</span>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
               {plans.map((plan, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     className="relative flex flex-col"
                  >
                     <div className="h-[34px] mb-3"></div>
                     <div className={`rounded-2xl border p-7 flex flex-col flex-1 ${
                        plan.highlight
                           ? 'border-[#EBCB8B]/30 bg-[#0d0d0d]'
                           : 'border-white/[0.06] bg-[#0d0d0d]'
                     }`}>
                        <div className="mb-1">
                           <span className={`${plan.badgeStyle} text-[9px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase inline-block mb-4`}>
                              {plan.badge}
                           </span>
                           <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                           <p className="text-white/35 text-xs mt-0.5">{plan.subtitle}</p>
                        </div>

                        <div className="mt-5 mb-1 flex items-baseline gap-1.5">
                           {plan.price === 0 ? (
                              <span className="text-[2.75rem] md:text-5xl font-extrabold text-white tracking-tight leading-none">
                                 Бесплатно
                              </span>
                           ) : (
                              <>
                                 <span className="text-[2.75rem] md:text-5xl font-extrabold text-white tracking-tight leading-none">
                                    {plan.price.toLocaleString('ru-RU')}
                                 </span>
                                 <span className="text-xl font-bold text-white/50">₽</span>
                              </>
                           )}
                        </div>

                        {plan.oldPrice ? (
                           <>
                              <div className="flex items-center gap-2.5 mt-2">
                                 <span className="text-sm text-white/25 line-through">
                                    {plan.oldPrice.toLocaleString('ru-RU')}₽
                                 </span>
                                 <span className="text-xs font-bold text-green-400">{plan.discount}</span>
                              </div>
                              <p className="text-[11px] text-white/20 mt-1.5">
                                 Цена после релиза: {plan.oldPrice.toLocaleString('ru-RU')}₽
                              </p>
                           </>
                        ) : (
                           <p className="text-[11px] text-white/20 mt-2">Без ограничений по времени</p>
                        )}

                        {/* шкала "осталось мест" — искусственный дефицит, чтобы подтолкнуть к покупке */}
                        {plan.remaining != null ? (
                           <div className="mt-4 mb-6">
                              <div className={`rounded-xl px-4 py-3 border ${
                                 plan.remaining <= 5
                                    ? 'bg-red-500/[0.06] border-red-500/20'
                                    : plan.remaining <= 10
                                       ? 'bg-[#EBCB8B]/[0.04] border-[#EBCB8B]/15'
                                       : 'bg-white/[0.02] border-white/[0.06]'
                              }`}>
                                 <div className="flex items-center justify-between mb-2">
                                    <span className="flex items-center gap-1.5 text-[11px] text-white/50 uppercase tracking-wider font-medium">
                                       {plan.remaining <= 5 ? (
                                          <Flame size={12} className="text-red-400 animate-pulse" />
                                       ) : (
                                          <Clock size={12} className="text-white/30" />
                                       )}
                                       Осталось мест
                                    </span>
                                    <span className={`text-sm font-extrabold tabular-nums ${
                                       plan.remaining <= 5
                                          ? 'text-red-400'
                                          : 'text-[#EBCB8B]'
                                    }`}>
                                       {plan.remaining}
                                       <span className="text-white/20 font-normal text-xs">/{plan.maxSlots}</span>
                                    </span>
                                 </div>
                                 <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                    <motion.div
                                       initial={{ width: 0 }}
                                       whileInView={{ width: `${(plan.remaining / plan.maxSlots) * 100}%` }}
                                       viewport={{ once: true }}
                                       transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                                       className={`h-full rounded-full ${
                                          plan.remaining <= 5
                                             ? 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                             : plan.remaining <= 10
                                                ? 'bg-gradient-to-r from-[#EBCB8B]/80 to-[#EBCB8B] shadow-[0_0_8px_rgba(235,203,139,0.25)]'
                                                : 'bg-gradient-to-r from-green-500/70 to-green-400 shadow-[0_0_8px_rgba(74,222,128,0.2)]'
                                       }`}
                                    />
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="mt-4 mb-6">
                              <div className="rounded-xl px-4 py-3 border bg-green-500/[0.04] border-green-500/15">
                                 <div className="flex items-center justify-between mb-2">
                                    <span className="flex items-center gap-1.5 text-[11px] text-white/50 uppercase tracking-wider font-medium">
                                       <Check size={12} className="text-green-400" />
                                       Доступно мест
                                    </span>
                                    <span className="text-sm font-extrabold text-green-400">∞</span>
                                 </div>
                                 <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                    <motion.div
                                       initial={{ width: 0 }}
                                       whileInView={{ width: '100%' }}
                                       viewport={{ once: true }}
                                       transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                                       className="h-full rounded-full bg-gradient-to-r from-green-500/70 to-green-400 shadow-[0_0_8px_rgba(74,222,128,0.2)]"
                                    />
                                 </div>
                              </div>
                           </div>
                        )}

                        <div className="w-full h-px bg-white/[0.06] mb-6"></div>

                        {/* список фич: входящие — золотая галочка, остальные приглушены */}
                        <ul className="space-y-3.5 mb-8 flex-1">
                           {allFeatures.map((feat, idx) => {
                              const active = plan.included.has(idx); // входит ли фича в этот тариф
                              return (
                                 <li key={idx} className={`flex items-start gap-2.5 text-sm ${active ? 'text-white/60' : 'text-white/20'}`}>
                                    <Check size={15} className={`mt-0.5 flex-shrink-0 ${active ? 'text-[#EBCB8B]' : 'text-white/15'}`} />
                                    {feat}
                                 </li>
                              );
                           })}
                        </ul>

                        {/* кнопка тарифа: блокируем, если это текущий план или он уже покрыт более высоким */}
                        {(() => {
                           const isCurrent = currentTier === plan.tier; // прямо этот тариф уже куплен
                           const isIncluded = currentTier != null && TIER_ORDER[plan.tier] < TIER_ORDER[currentTier]; // тариф ниже текущего — уже включён
                           const disabled = isCurrent || isIncluded;
                           const label = isCurrent ? 'Текущий план' : isIncluded ? 'Включено' : plan.btnText;
                           return (
                              <button
                                 onClick={() => !disabled && onSelectPlan?.(plan.tier)}
                                 disabled={disabled}
                                 className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all text-center block ${
                                    disabled
                                       ? 'bg-white/[0.03] border border-white/[0.06] text-white/30 cursor-default'
                                       : plan.highlight
                                          ? 'btn-gold-primary'
                                          : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white'
                                 }`}
                              >
                                 {label}
                              </button>
                           );
                        })()}
                     </div>
                  </motion.div>
               ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-14">
               <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs font-medium"><Shield size={13} className="text-green-500/50" /> Безопасная оплата</span>
               <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs font-medium"><Lock size={13} className="text-[#EBCB8B]/50" /> Лицензия навсегда</span>
               <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs font-medium"><RefreshCw size={13} className="text-blue-400/50" /> Бесплатные обновления</span>
            </div>
         </div>
      </section>
   );
};
