"use client";

import { type ThemePreference, useTheme } from "@/providers/theme-provider";

const themes: Array<{ value: ThemePreference; label: string; icon: string }> = [
  { value: "light", label: "Light", icon: "☀" },
  { value: "dark", label: "Dark", icon: "☾" },
];

export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      aria-label="Color theme"
      className="theme-switcher fixed bottom-4 right-4 z-50 flex rounded-2xl border p-1 shadow-xl backdrop-blur"
      role="group"
    >
      {themes.map((theme) => (
        <button
          aria-pressed={preference === theme.value}
          className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          key={theme.value}
          onClick={() => setPreference(theme.value)}
          title={`${theme.label} theme`}
          type="button"
        >
          <span aria-hidden="true">{theme.icon}</span>
          <span className="hidden sm:inline">{theme.label}</span>
        </button>
      ))}
    </div>
  );
}
