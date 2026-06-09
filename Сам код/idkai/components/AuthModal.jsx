import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { apiGoogleLogin } from '../services/api';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''; // прилетает из vite define

// модалка входа — внутри живёт официальная гугловская кнопка
export const AuthModal = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const buttonRef = useRef(null); // в этот div гугл сам отрисует свою кнопку

  // сюда гугл вернёт credential после успешного входа
  const handleCredential = useCallback(async (response) => {
    setLoading(true);
    setError('');
    try {
      const account = await apiGoogleLogin(response.credential);
      setLoading(false);
      onSubmit(account);
    } catch {
      setLoading(false);
      setError('Не удалось войти. Попробуйте ещё раз.');
    }
  }, [onSubmit]);

  // рисуем гугл-кнопку каждый раз, когда модалку открывают
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setLoading(false);
    if (!GOOGLE_CLIENT_ID) return; // нечем рендерить, если client id не задан

    let cancelled = false; // флаг, чтобы не дёргать render после закрытия
    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      buttonRef.current.innerHTML = ''; // на всякий чистим, чтобы не было двух кнопок
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      render(); // скрипт гугла уже подгрузился
    } else {
      // скрипт ещё не приехал — ждём его, проверяя каждые 200мс
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          render();
        }
      }, 200);
      return () => { cancelled = true; clearInterval(interval); };
    }
    return () => { cancelled = true; };
  }, [isOpen, handleCredential]);

  // закрытие по Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* затемнённый фон — клик по нему закрывает окно */}
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
            {/* stopPropagation, чтобы клик по самому окну не считался кликом по фону */}
            <div className="relative w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-[#EBCB8B]/20 to-transparent blur-xl pointer-events-none" />
              <div className="relative bg-[#0d0d0d] border border-white/8 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#EBCB8B]/40 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-[#EBCB8B]/5 blur-2xl rounded-full pointer-events-none" />
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-all text-white/50 hover:text-white"
                >
                  <X size={14} />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EBCB8B]/10 border border-[#EBCB8B]/20 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-[#EBCB8B]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Вход в IDK</h3>
                    <p className="text-white/40 text-xs">Регистрация и вход через Google</p>
                  </div>
                </div>

                <p className="text-white/40 text-sm mb-6 mt-4">
                  Войдите через Google — аккаунт создаётся автоматически, и план <span className="text-[#EBCB8B] font-semibold">Free</span> уже доступен. Платные тарифы можно оформить прямо на сайте.
                </p>

                {/* если гугл не настроен — вместо кнопки показываем подсказку разработчику */}
                {!GOOGLE_CLIENT_ID ? (
                  <div className="flex items-start gap-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-4 py-3.5">
                    <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-200/80 text-xs leading-relaxed">
                      Google-вход не настроен. Задайте <span className="font-mono">GOOGLE_CLIENT_ID</span> в файле <span className="font-mono">.env.local</span> и перезапустите сервер.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 min-h-[60px]">
                    {/* сюда монтируется кнопка гугла; на время входа притушим её */}
                    <div ref={buttonRef} className={loading ? 'opacity-40 pointer-events-none' : ''} />
                    {loading && (
                      <span className="text-white/40 text-xs flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Входим...
                      </span>
                    )}
                  </div>
                )}

                {error && <p className="text-red-400 text-xs mt-4 text-center">{error}</p>}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
