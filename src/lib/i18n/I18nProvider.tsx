import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang } from "./translations";

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  transitioning: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "poisson:lang";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "pt";
  const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (saved && ["pt", "en", "es"].includes(saved)) return saved;
  const nav = window.navigator.language.toLowerCase();
  if (nav.startsWith("en")) return "en";
  if (nav.startsWith("es")) return "es";
  return "pt";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setLangState(detectInitial());
  }, []);

  const setLang = useCallback((next: Lang) => {
    setTransitioning(true);
    window.setTimeout(() => {
      setLangState(next);
      window.localStorage.setItem(STORAGE_KEY, next);
      window.setTimeout(() => setTransitioning(false), 450);
    }, 250);
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? translations.pt[key] ?? key,
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, transitioning }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}