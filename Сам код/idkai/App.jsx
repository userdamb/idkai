import React, { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { SmartCloneSection } from './components/SmartCloneSection';
import { FeaturesGrid } from './components/FeaturesGrid';
import { StatsSection } from './components/StatsSection';
import { PricingSection } from './components/PricingSection';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { apiFetchMe, apiLogout } from './services/api';

// под этим ключом храним токен сессии в localStorage
const TOKEN_KEY = 'idk_session_token';

function App() {
  const [view, setView] = useState('landing'); // что сейчас показываем: лендинг или дашборд
  const [account, setAccount] = useState(null); // данные залогиненного юзера
  const [authOpen, setAuthOpen] = useState(false); // открыто ли окно входа
  const [pendingTier, setPendingTier] = useState(null); // тариф, который выбрали ещё до входа
  const [paymentTier, setPaymentTier] = useState(null); // тариф, который сейчас оплачиваем
  const [loading, setLoading] = useState(true); // пока проверяем токен — крутим заглушку

  useEffect(() => {
    // при старте смотрим, не залогинен ли уже юзер
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    // токен есть — спросим у сервера, кто это
    apiFetchMe(token).then((data) => {
      if (data) {
        setAccount({ token, ...data });
      } else {
        // токен протух — выкидываем его
        localStorage.removeItem(TOKEN_KEY);
      }
      setLoading(false);
    });
  }, []);

  // успешно вошли — сохраняем токен и решаем, куда вести юзера
  const handleAuthSuccess = (acc) => {
    localStorage.setItem(TOKEN_KEY, acc.token);
    setAccount(acc);
    setAuthOpen(false);
    if (pendingTier) {
      // юзер до входа уже тыкнул тариф — сразу к оплате
      setPaymentTier(pendingTier);
      setPendingTier(null);
    } else {
      setView('dashboard');
    }
  };

  // выход: чистим всё, что связано с сессией
  const handleLogout = async () => {
    if (account?.token) await apiLogout(account.token);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('idk_session_start');
    setAccount(null);
    setView('landing');
  };

  const handleOpenDashboard = () => {
    if (account) {
      setView('dashboard');
    } else {
      setPendingTier(null);
      setAuthOpen(true);
    }
  };

  const handleGetStarted = () => {
    if (account) {
      setView('dashboard');
    } else {
      setPendingTier(null);
      setAuthOpen(true);
    }
  };

  // выбор тарифа на странице цен
  const handleSelectPlan = (tier) => {
    if (tier === 'free') {
      // бесплатный тариф — просто регистрация, без оплаты
      handleGetStarted();
      return;
    }
    if (account) {
      setPaymentTier(tier);
    } else {
      // не залогинен — сначала вход, тариф запомним
      setPendingTier(tier);
      setAuthOpen(true);
    }
  };

  // оплата прошла — обновляем тариф в аккаунте и ведём в дашборд
  const handlePaymentSuccess = (updated) => {
    setAccount((prev) => ({ ...prev, ...updated }));
    setPaymentTier(null);
    setView('dashboard');
  };

  // пока тянем данные юзера — показываем экран загрузки
  if (loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <div className="bg-spotlight"></div>
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    );
  }

  // залогинен и открыл личный кабинет
  if (view === 'dashboard' && account) {
    return (
      <div className="relative min-h-screen text-white selection:bg-[#EBCB8B] selection:text-black">
        <div className="bg-spotlight"></div>
        <Dashboard
          account={account}
          onLogout={handleLogout}
          onGoHome={() => setView('landing')}
          onUpgrade={(tier) => setPaymentTier(tier)}
          onAccountUpdate={(updated) => setAccount((prev) => ({ ...prev, ...updated }))}
        />
        <PaymentModal
          isOpen={!!paymentTier}
          tier={paymentTier}
          token={account.token}
          onClose={() => setPaymentTier(null)}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  // обычный лендинг для гостей
  return (
    <div className="relative min-h-screen text-white selection:bg-[#EBCB8B] selection:text-black">
      <div className="bg-spotlight"></div>

      <Navigation onOpenDashboard={handleOpenDashboard} onGoHome={() => setView('landing')} hasAccount={!!account} />

      <main>
        <Hero onGetStarted={handleGetStarted} />
        {/* тонкая золотая полоска-разделитель между блоками */}
        <div className="max-w-[1000px] mx-auto h-px bg-gradient-to-r from-transparent via-[#EBCB8B]/20 to-transparent"></div>
        <SmartCloneSection />
        <div className="max-w-[1000px] mx-auto h-px bg-gradient-to-r from-transparent via-[#EBCB8B]/20 to-transparent"></div>
        <FeaturesGrid />
        <div className="max-w-[1000px] mx-auto h-px bg-gradient-to-r from-transparent via-[#EBCB8B]/20 to-transparent"></div>
        <StatsSection />
        <div className="max-w-[1000px] mx-auto h-px bg-gradient-to-r from-transparent via-[#EBCB8B]/20 to-transparent"></div>
        <PricingSection onSelectPlan={handleSelectPlan} account={account} />
      </main>

      <Footer />

      <AuthModal
        isOpen={authOpen}
        onClose={() => { setAuthOpen(false); setPendingTier(null); }}
        onSubmit={handleAuthSuccess}
      />

      <PaymentModal
        isOpen={!!paymentTier}
        tier={paymentTier}
        token={account?.token}
        onClose={() => setPaymentTier(null)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default App;
