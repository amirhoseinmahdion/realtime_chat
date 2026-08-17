"use client";

import { useLanguage } from "@/providers/language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const nextLanguage = language === "en" ? "fa" : "en";
  return (
    <button
      aria-label={nextLanguage === "fa" ? "تغییر زبان به فارسی" : "Switch language to English"}
      className="preference-button fixed end-[4.25rem] top-4 z-50"
      onClick={() => setLanguage(nextLanguage)}
      title={nextLanguage === "fa" ? "فارسی" : "English"}
      type="button"
    >
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 12h17M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21m0-18C9.8 5.4 8.7 8.4 8.7 12s1.1 6.6 3.3 9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>
      <span className="absolute -bottom-1 -right-1 grid min-w-5 place-items-center rounded-full bg-teal-300 px-1 text-[8px] font-black leading-5 text-slate-950">{nextLanguage === "fa" ? "فا" : "EN"}</span>
    </button>
  );
}
