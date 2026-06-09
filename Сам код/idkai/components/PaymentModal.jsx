import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CreditCard, Check, Lock } from 'lucide-react';
import { apiPurchase } from '../services/api';

// названия и цены тарифов для окна оплаты
const PLAN_INFO = {
  standard: { name: 'Standard', price: 14990 },
  pro: { name: 'Pro', price: 39990 },
};

// форматируем номер карты: только цифры, максимум 16, разбиваем по 4 через пробел
function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

// окно оплаты (демо — карта никуда не уходит, просто меняем тариф на сервере)
export const PaymentModal = ({ isOpen, onClose, tier, token, onSuccess }) => {
  const plan = PLAN_INFO[tier];
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // каждый раз при открытии сбрасываем форму в исходное состояние
  useEffect(() => {
    if (isOpen) {
      setCard(''); setExpiry(''); setCvc('');
      setLoading(false); setDone(false); setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // "оплата": карту не проверяем по-настоящему, просто просим сервер включить тариф
  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const account = await apiPurchase(token, tier);
      setLoading(false);
      setDone(true);
      // даём секунду полюбоваться галочкой "успех", потом закрываем
      setTimeout(() => { onSuccess(account); }, 1200);
    } catch {
      setLoading(false);
      setError('Не удалось завершить оплату. Попробуйте ещё раз.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && plan && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-[#EBCB8B]/20 to-transparent blur-xl pointer-events-none" />
              <div className="relative bg-[#0d0d0d] border border-white/8 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#EBCB8B]/40 to-transparent" />
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-all text-white/50 hover:text-white"
                >
                  <X size={14} />
                </button>

                {/* после успешной оплаты показываем экран "готово", иначе — форму */}
                {done ? (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
                      <Check size={26} className="text-green-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Оплата прошла</h3>
                    <p className="text-white/40 text-sm">Тариф <span className="text-[#EBCB8B] font-semibold">{plan.name}</span> активирован.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
                        <CreditCard size={18} className="text-[#EBCB8B]" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Оплата тарифа {plan.name}</h3>
                        <p className="text-white/40 text-xs">Тестовая оплата — деньги не списываются</p>
                      </div>
                    </div>

                    <div className="mb-5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8 flex items-center justify-between">
                      <span className="text-white/50 text-sm">К оплате</span>
                      <span className="text-white font-bold text-lg">{plan.price.toLocaleString('ru-RU')} ₽</span>
                    </div>

                    <form onSubmit={handlePay} className="space-y-3">
                      <div className="relative">
                        <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0000 0000 0000 0000"
                          value={card}
                          onChange={(e) => setCard(formatCardNumber(e.target.value))}
                          required
                          className="w-full bg-white/5 border border-white/8 focus:border-[#EBCB8B]/50 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-colors font-mono tracking-wider"
                        />
                      </div>
                      <div className="flex gap-3">
                        {/* срок действия: сами подставляем "/" после месяца */}
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="ММ/ГГ"
                          value={expiry}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                          }}
                          required
                          className="flex-1 bg-white/5 border border-white/8 focus:border-[#EBCB8B]/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-colors font-mono"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="CVC"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          required
                          className="w-24 bg-white/5 border border-white/8 focus:border-[#EBCB8B]/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-colors font-mono"
                        />
                      </div>
                      {error && <p className="text-red-400 text-xs">{error}</p>}
                      <button type="submit" disabled={loading} className="w-full btn-gold-primary py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <><Loader2 size={16} className="animate-spin" /> Обработка...</> : <>Оплатить {plan.price.toLocaleString('ru-RU')} ₽</>}
                      </button>
                    </form>

                    <p className="flex items-center justify-center gap-1.5 text-white/25 text-[11px] mt-4">
                      <Lock size={11} /> Демонстрационная оплата. Реальное списание не происходит.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
