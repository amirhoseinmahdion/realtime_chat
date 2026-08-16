"use client";

import { useLanguage } from "@/providers/language-provider";
import { useTheme } from "@/providers/theme-provider";

export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();
  const { t } = useLanguage();
  const nextTheme = preference === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={t(nextTheme === "light" ? "Switch to light theme" : "Switch to dark theme")}
      className="preference-button fixed bottom-4 right-4 z-50"
      onClick={() => setPreference(nextTheme)}
      title={t(nextTheme === "light" ? "Switch to light theme" : "Switch to dark theme")}
      type="button"
    >
      {preference === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2m-2.8-6.7-1.4 1.4M6.7 17.3l-1.4 1.4m0-13.4 1.4 1.4m10.6 10.6 1.4 1.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>;
}

function MoonIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>;
}
