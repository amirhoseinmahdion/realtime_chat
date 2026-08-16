"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark";

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const storageKey = "online-chat:theme:v1";
const legacyStorageKey = "echoline:theme:v1";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = preference;
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey);
    const initial: ThemePreference = stored === "light" ? "light" : "dark";
    localStorage.setItem(storageKey, initial);
    localStorage.removeItem(legacyStorageKey);
    queueMicrotask(() => setPreferenceState(initial));
    applyTheme(initial);
  }, []);

  function setPreference(nextPreference: ThemePreference) {
    localStorage.setItem(storageKey, nextPreference);
    setPreferenceState(nextPreference);
    applyTheme(nextPreference);
  }

  const value = useMemo(() => ({ preference, setPreference }), [preference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
