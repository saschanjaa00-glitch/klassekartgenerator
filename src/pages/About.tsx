import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createTranslator } from '../i18n';
import type { Language } from '../i18n';
import '../App.css';

type AboutProps = {
  language: Language;
};

export function About({ language }: AboutProps) {
  const t = useMemo(() => createTranslator(language), [language]);
  const canonicalBase = 'https://www.mittklassekart.com';
  const canonicalUrl = `${canonicalBase}/about`;
  const pageTitle = language === 'no' ? 'Om MittKlassekart.com' : 'About MittKlassekart.com';
  const pageDescription = language === 'no'
    ? 'Lær om MittKlassekart.com, funksjoner, personvern og teknologien bak verktøyet.'
    : 'Learn about MittKlassekart.com, its features, privacy, and the technology behind the tool.';

  useEffect(() => {
    const setMeta = (attr: 'name' | 'property', value: string, content: string) => {
      let element = document.head.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setCanonical = (url: string) => {
      let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
      }
      element.setAttribute('href', url);
    };

    document.title = pageTitle;
    document.documentElement.lang = language === 'no' ? 'no' : 'en';
    setMeta('name', 'description', pageDescription);
    setCanonical(canonicalUrl);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDescription);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'twitter:card', 'summary_large_image');
    setMeta('property', 'twitter:title', pageTitle);
    setMeta('property', 'twitter:description', pageDescription);
  }, [canonicalUrl, language, pageDescription, pageTitle]);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <nav className="about-nav">
          <Link to="/" className="nav-link">← {language === 'no' ? 'Tilbake' : 'Back'}</Link>
        </nav>
      </aside>

      <main className="main-content about-content">
        <Link to="/" className="back-link">← {language === 'no' ? 'Tilbake' : 'Back'}</Link>
        <div className="about-section">
          <h1>{language === 'no' ? 'Om MittKlassekart.com' : 'About MittKlassekart.com'}</h1>
          
          <section>
            <h2>{language === 'no' ? 'Hva er MittKlassekart.com?' : 'What is MittKlassekart.com?'}</h2>
            <p>
              {language === 'no'
                ? 'MittKlassekart.com er et verktøy designet for lærere og skolepersonell for å generere og organisere klasserom. Det gjør det enkelt å lage klassekart med automatisk plassering eller manuell tilpasning.'
                : 'MittKlassekart.com is a tool designed for teachers and school staff to generate and organize classroom seating arrangements. It makes it easy to create seating plans with automatic placement or manual customization.'}
            </p>
          </section>

          <section>
            <h2>{language === 'no' ? 'Hovudfunksjoner' : 'Key Features'}</h2>
            <ul>
              <li>{language === 'no' ? '📊 Lag sitteplaner med tilpasset størrelse' : '📊 Create seating plans with custom sizes'}</li>
              <li>{language === 'no' ? '🔀 Automatisk og manuell plassering' : '🔀 Automatic and manual seating'}</li>
              <li>{language === 'no' ? '👥 Gruppering og begrensninger' : '👥 Grouping and constraints'}</li>
              <li>{language === 'no' ? '📁 Eksportér og importer planer' : '📁 Export and import plans'}</li>
              <li>{language === 'no' ? '🖨️ Skriv ut som PDF eller PNG' : '🖨️ Print as PDF or PNG'}</li>
              <li>{language === 'no' ? '⚡ Alt lagres lokalt ' : '⚡ Everything saved locally'}</li>
            </ul>
          </section>

          <section>
            <h2>{language === 'no' ? 'Personvern' : 'Privacy'}</h2>
            <p>
              {language === 'no'
                ? 'Alle dine data lagres lokalt i nettleseren din. Vi samler ikke, lagrer ikke eller deler ikke persondata. Du har full kontroll over informasjonen din.'
                : 'All your data is stored locally in your browser. We do not collect, store, or share any personal information. You have complete control over your information.'}
            </p>
          </section>

          <section>
            <h2>{language === 'no' ? 'Teknologi' : 'Technology'}</h2>
            <p>
              {language === 'no'
                ? 'Klassekart er bygget med React, TypeScript og Vite for maksimal ytelse og stabilitet.'
                : 'Seating Chart is built with React, TypeScript, and Vite for maximum performance and stability.'}
            </p>
          </section>

          <section>
            <h2>{language === 'no' ? 'Støtt oss' : 'Support Us'}</h2>
            <p>
              {language === 'no'
                ? 'Liker du MittKlassekart.com? Vurder å gi en donasjon på PayPal.'
                : 'Like MittKlassekart.com? Consider making a donation on PayPal.'}
            </p>
            <a
              className="btn btn-primary"
              href="https://www.paypal.com/donate/?hosted_button_id=JFTXHNDM92CL8"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('donateLabel')}
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
