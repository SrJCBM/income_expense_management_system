// frontend/src/context/LanguageContext.jsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import es from '../locales/es.js';
import en from '../locales/en.js';

const translations = { es, en };
const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'es');

  const t = useCallback(
    (key) => key.split('.').reduce((obj, k) => obj?.[k], translations[lang]) ?? key,
    [lang]
  );

  const toggleLang = useCallback(() => {
    const next = lang === 'es' ? 'en' : 'es';
    setLang(next);
    localStorage.setItem('lang', next);
  }, [lang]);

  const value = useMemo(() => ({ lang, t, toggleLang }), [lang, t, toggleLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  return ctx;
};
