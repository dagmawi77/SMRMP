import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getTranslation, LANGUAGES } from '../i18n/registrationTranslations';

const RegistrationUiContext = createContext(null);

export function RegistrationUiProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('smrmp_reg_lang') || 'en';
    return saved === 'om' ? 'en' : saved;
  });

  useEffect(() => {
    localStorage.setItem('smrmp_reg_lang', language);
  }, [language]);

  const t = useMemo(() => getTranslation(language), [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      t,
    }),
    [language, t]
  );

  return (
    <RegistrationUiContext.Provider value={value}>
      {children}
    </RegistrationUiContext.Provider>
  );
}

export function useRegistrationUi() {
  const ctx = useContext(RegistrationUiContext);
  if (!ctx) throw new Error('useRegistrationUi must be used within RegistrationUiProvider');
  return ctx;
}

export default RegistrationUiContext;
