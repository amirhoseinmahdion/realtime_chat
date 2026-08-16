import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource/vazirmatn/arabic-400.css";
import "@fontsource/vazirmatn/arabic-500.css";
import "@fontsource/vazirmatn/arabic-600.css";
import "@fontsource/vazirmatn/arabic-700.css";
import "./globals.css";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AuthProvider } from "@/providers/auth-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export const metadata: Metadata = {
  title: "Online Chat",
  description: "A real-time chat application",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem("online-chat:theme:v1")||localStorage.getItem("echoline:theme:v1");var l=localStorage.getItem("online-chat:language:v1")==="fa"?"fa":"en";document.documentElement.dataset.theme=p==="light"?"light":"dark";document.documentElement.lang=l;document.documentElement.dir=l==="fa"?"rtl":"ltr"}catch(e){document.documentElement.dataset.theme="dark"}})();`,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
            <ThemeSwitcher />
            <LanguageSwitcher />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
