"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import enTranslations from "@/locales/en.json";
import arTranslations from "@/locales/ar.json";
import { translateDynamic } from "@/lib/dynamicTranslator";

export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

interface LanguageContextProps {
  language: Language;
  dir: Direction;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  tDynamic: (text: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "shaz_language";

const translations: Record<Language, any> = {
  en: enTranslations,
  ar: arTranslations,
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage (default: English)
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (savedLang === "ar" || savedLang === "en") {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
      } else {
        setLanguageState("en");
        document.documentElement.lang = "en";
        document.documentElement.dir = "ltr";
      }
    } catch {
      setLanguageState("en");
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      }
    } catch {}
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "ar" : "en");
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split(".");
      let current: any = translations[language];

      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          current = undefined;
          break;
        }
      }

      if (typeof current === "string") {
        return current;
      }

      // Fallback to English if translation is missing in current language
      if (language !== "en") {
        let enCurrent: any = translations.en;
        for (const k of keys) {
          if (enCurrent && typeof enCurrent === "object" && k in enCurrent) {
            enCurrent = enCurrent[k];
          } else {
            enCurrent = undefined;
            break;
          }
        }
        if (typeof enCurrent === "string") {
          return enCurrent;
        }
      }

      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  const tDynamic = useCallback(
    (text: string | null | undefined): string => {
      return translateDynamic(text, language);
    },
    [language]
  );

  const dir: Direction = language === "ar" ? "rtl" : "ltr";
  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir,
        isRTL,
        setLanguage,
        toggleLanguage,
        t,
        tDynamic,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
