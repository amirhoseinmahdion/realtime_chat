import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthProvider } from "@/providers/auth-provider";
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
            __html: `(function(){try{var p=localStorage.getItem("online-chat:theme:v1")||localStorage.getItem("echoline:theme:v1");document.documentElement.dataset.theme=p==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
