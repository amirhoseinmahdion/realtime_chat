import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export const metadata: Metadata = {
  title: "EchoLine",
  description: "A real-time chat application",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem("echoline:theme:v1")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){document.documentElement.dataset.theme="dark"}})();`,
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
