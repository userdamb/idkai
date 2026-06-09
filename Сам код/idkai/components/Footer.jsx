import React from 'react';
// подвал сайта
export const Footer = () => {
  return (
    <footer className="py-16 px-6 md:px-12 border-t border-white/5 bg-black/50 backdrop-blur-lg">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* логотип + описание, занимает две колонки */}
        <div className="md:col-span-2">
          {/* клик по лого плавно скроллит наверх */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-3 mb-6 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EBCB8B] to-[#D4AF37] flex items-center justify-center text-black text-sm font-extrabold">
              IDK
            </div>
            <span className="text-white/10 text-5xl font-extrabold tracking-tighter uppercase select-none">IDK</span>
          </a>
          <p className="text-white/30 text-sm max-w-xs">
            AI-сотрудники для бизнеса. Автоматизация продаж и поддержки.
          </p>
        </div>
        <div>
          <h4 className="text-[#EBCB8B] uppercase tracking-widest text-xs mb-6 font-bold">Платформа</h4>
          <ul className="space-y-3 text-white/50 text-sm">
            <li><a href="#технология" className="hover:text-[#EBCB8B] transition-colors">Технология</a></li>
            <li><a href="#функции" className="hover:text-[#EBCB8B] transition-colors">Функции</a></li>
            <li><a href="#цены" className="hover:text-[#EBCB8B] transition-colors">Цены</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[#EBCB8B] uppercase tracking-widest text-xs mb-6 font-bold">Контакты</h4>
          <ul className="space-y-3 text-white/50 text-sm">
            <li>hello@idk.ai</li>
            <li>Поддержка: hello@idk.ai</li>
            {/* год подставляется сам, чтобы не править руками каждый январь */}
            <li className="mt-8 text-white/25 text-xs">
              &copy; {new Date().getFullYear()} IDK AI. <br /> Все права защищены.
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};