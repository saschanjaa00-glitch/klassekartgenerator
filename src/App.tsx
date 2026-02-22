import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Help } from './pages/Help';
import { createTranslator, isLanguage } from './i18n';
import type { Language } from './i18n';
import './App.css';

function AppLayout() {
  const [language, setLanguage] = useState<Language>('no');
  const t = useMemo(() => createTranslator(language), [language]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if URL has /en or /no prefix
    if (location.pathname.startsWith('/en')) {
      setLanguage('en');
      localStorage.setItem('language', 'en');
      // Redirect to clean URL
      const cleanPath = location.pathname.replace(/^\/en/, '') || '/';
      navigate(cleanPath, { replace: true });
    } else if (location.pathname.startsWith('/no')) {
      setLanguage('no');
      localStorage.setItem('language', 'no');
      // Redirect to clean URL
      const cleanPath = location.pathname.replace(/^\/no/, '') || '/';
      navigate(cleanPath, { replace: true });
    } else {
      // Fall back to localStorage
      const storedLanguage = localStorage.getItem('language');
      if (isLanguage(storedLanguage)) {
        setLanguage(storedLanguage);
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-actions" aria-label={t('languageLabel')}>
          <nav className="header-nav">
            <Link to="/" className="nav-link">{language === 'no' ? 'Hjem' : 'Home'}</Link>
            <Link to="/help" className="nav-link">{language === 'no' ? 'Hjelp' : 'Help'}</Link>
            <Link to="/about" className="nav-link">{language === 'no' ? 'Om' : 'About'}</Link>
          </nav>
          <div className="language-switcher">
            <button
              type="button"
              className={`lang-button ${language === 'no' ? 'active' : ''}`}
              onClick={() => {
                setLanguage('no');
                localStorage.setItem('language', 'no');
              }}
              aria-pressed={language === 'no'}
            >
              {t('languageNo')}
            </button>
            <span className="lang-separator">/</span>
            <button
              type="button"
              className={`lang-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => {
                setLanguage('en');
                localStorage.setItem('language', 'en');
              }}
              aria-pressed={language === 'en'}
            >
              {t('languageEn')}
            </button>
          </div>
          <a
            className="paypal-donate"
            href="https://www.paypal.com/donate/?hosted_button_id=JFTXHNDM92CL8"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('donateLabel')}
          </a>
        </div>
        <div className="brand-kicker">
          <span className="brand-title">mittKlassekart.com</span>
          <span className="brand-subtitle">{t('brandSubtitle')}</span>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home language={language} />} />
        <Route path="/help" element={<Help language={language} />} />
        <Route path="/about" element={<About language={language} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
