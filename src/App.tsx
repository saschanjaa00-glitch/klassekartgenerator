import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Help } from './pages/Help';
import { createTranslator, isLanguage } from './i18n';
import type { Language } from './i18n';
import './App.css';

function LanguageRedirect() {
  const { lang, '*': path } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (lang === 'en' || lang === 'no') {
      localStorage.setItem('language', lang);
      // Redirect to clean path
      const cleanPath = path ? `/${path}` : '/';
      navigate(cleanPath, { replace: true });
    }
  }, [lang, path, navigate]);

  return null;
}

function AppLayout() {
  const [language, setLanguage] = useState<Language>('no');
  const t = useMemo(() => createTranslator(language), [language]);

  useEffect(() => {
    // Read language from localStorage, or check URL params
    const storedLanguage = localStorage.getItem('language');
    if (isLanguage(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

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
        {/* Catch all /en/* and /no/* paths and redirect */}
        <Route path="/:lang/*" element={<LanguageRedirect />} />
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
