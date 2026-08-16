"use client";

import { useLanguage } from "@/providers/language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div aria-label="Language" className="theme-switcher fixed bottom-4 left-4 z-50 flex rounded-2xl border p-1 shadow-xl backdrop-blur" role="group">
      <button aria-pressed={language === "en"} className="h-9 rounded-xl px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400" onClick={() => setLanguage("en")} type="button">EN</button>
      <button aria-pressed={language === "fa"} className="h-9 rounded-xl px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400" onClick={() => setLanguage("fa")} type="button">فا</button>
    </div>
  );
}
