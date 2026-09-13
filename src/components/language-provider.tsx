"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Language, LANGUAGE_STORAGE_KEY } from "@/lib/language";
import { translations } from "@/lib/translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <T extends keyof (typeof translations)["en"]>(
    section: T,
  ) => (typeof translations)["en"][T];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === "en" || stored === "pt" || stored === "de") {
        setLanguageState(stored);
      }
    } catch {
      // ignore failure to read stored language
    }
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore failure to persist language
    }
  };

  const t = <T extends keyof (typeof translations)["en"]>(section: T) =>
    translations[language][section] as (typeof translations)["en"][T];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
