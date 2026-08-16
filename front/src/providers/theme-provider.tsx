"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const storageKey = "echoline:theme:v1";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference);
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    const initial = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    queueMicrotask(() => setPreferenceState(initial));
    applyTheme(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => {
      if ((localStorage.getItem(storageKey) ?? "system") === "system") applyTheme("system");
    };
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
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
