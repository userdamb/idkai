import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Navigation = ({ onOpenDashboard, onGoHome, hasAccount }) => {
  const [isOpen, setIsOpen] = useState(false); // открыто ли мобильное меню-гамбургер
  // пункты меню — ведут к якорям на лендинге
  const navItems = [
    { label: 'Технология', href: '#технология' },
    { label: 'Функции', href: '#функции' },
    { label: 'Конвейер', href: '#функции' },
    { label: 'Цены', href: '#цены' },
  ];

  return (
    <>
    {/* шапка прибита к верху и не уезжает при скролле */}
    <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-10 py-4 bg-black/60 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">

        {/* логотип для десктопа */}
        <div className="hidden md:block">
          <button onClick={() => { onGoHome?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2.5 select-none cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#EBCB8B] to-[#D4AF37] flex items-center justify-center text-black font-extrabold text-sm tracking-tight">
              IDK
            </div>
            <span className="text-white font-bold text-lg tracking-tight">i don't know</span>
          </button>
        </div>

        {/* ссылки меню по центру */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium">
              {item.label}
            </a>
          ))}
        </div>

        <div className="md:hidden">
          <button onClick={() => { onGoHome?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2.5 select-none cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#EBCB8B] to-[#D4AF37] flex items-center justify-center text-black font-extrabold text-sm tracking-tight">
              IDK
            </div>
            <span className="text-white font-bold text-lg tracking-tight">i don't know</span>
          </button>
        </div>

        {/* кнопки справа: гостю — войти/регистрация, юзеру — дашборд */}
        <div className="hidden md:flex items-center gap-4">
          {!hasAccount && (
            <button
              onClick={onOpenDashboard}
              className="text-sm font-bold text-[#EBCB8B] hover:text-[#FFD700] transition-colors tracking-wide"
            >
              Войти
            </button>
          )}
          <button
            onClick={onOpenDashboard}
            className="text-[13px] font-medium px-5 py-2 rounded-full bg-transparent border border-white/[0.06] text-white hover:border-white/20 transition-all duration-500"
          >
            {hasAccount ? 'Dashboard' : 'Регистрация'}
          </button>
        </div>

        {/* кнопка-гамбургер, видна только на мобиле */}
        <div className="md:hidden z-50">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none text-white hover:text-[#EBCB8B] transition-colors">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>

    {/* выезжающее сверху полноэкранное меню для телефона */}
    <div className={`fixed inset-0 bg-[#0a0a0a] flex flex-col justify-center items-center transition-transform duration-500 ease-in-out z-40 ${isOpen ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'}`}>
      {navItems.map((item) => (
        <a key={item.label} href={item.href} onClick={() => setIsOpen(false)} className="text-3xl font-bold mb-8 hover:text-[#EBCB8B] transition-colors tracking-tight text-white">
          {item.label}
        </a>
      ))}
      <button
        onClick={() => { setIsOpen(false); onOpenDashboard(); }}
        className="text-2xl font-bold mb-8 hover:text-[#EBCB8B] transition-colors tracking-tight text-white"
      >
        {hasAccount ? 'Dashboard' : 'Войти'}
      </button>
      {!hasAccount && (
        <button
          onClick={() => { setIsOpen(false); onOpenDashboard(); }}
          className="mt-4 bg-[#EBCB8B] text-black text-base font-bold px-8 py-3 rounded-full"
        >
          Регистрация
        </button>
      )}
    </div>
    </>
  );
};
