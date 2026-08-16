"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "fa";

const persian: Record<string, string> = {
  "Online Chat": "گفت‌وگوی آنلاین",
  "Live conversations": "گفت‌وگوی زنده",
  "Simple. Fast. Together.": "ساده، سریع، کنار هم",
  "Your people are only one message away.": "دوستان شما فقط یک پیام فاصله دارند.",
  "Search, connect, and continue every conversation in a focused space built for real-time chat.": "جست‌وجو کنید، ارتباط بگیرید و گفت‌وگوها را در فضایی سریع و متمرکز ادامه دهید.",
  "Instant delivery": "ارسال فوری",
  "Live presence": "وضعیت آنلاین",
  "Conversation history": "تاریخچه گفت‌وگو",
  "Private by design. Ready whenever you are.": "خصوصی و امن؛ همیشه آماده برای شما.",
  "Good to see you again": "از دیدنتان خوشحالیم",
  "Start chatting today": "همین امروز گفت‌وگو را شروع کنید",
  "Continue to Online Chat": "ورود به گفت‌وگوی آنلاین",
  "Create your Online Chat account": "حساب گفت‌وگوی آنلاین خود را بسازید",
  "Sign in to see your conversations and reconnect with your people.": "وارد شوید و گفت‌وگوهای خود را ادامه دهید.",
  "Create your profile, find people, and start a conversation in seconds.": "پروفایل بسازید، دوستانتان را پیدا کنید و در چند ثانیه گفت‌وگو را آغاز کنید.",
  "Display name": "نام نمایشی", Username: "نام کاربری", Password: "رمز عبور", Optional: "اختیاری",
  Show: "نمایش", Hide: "پنهان", "Sign in": "ورود", "Create account": "ساخت حساب",
  "Signing in…": "در حال ورود…", "Creating account…": "در حال ساخت حساب…",
  "Already have an account?": "قبلاً حساب ساخته‌اید؟", "New to Online Chat?": "تازه به گفت‌وگوی آنلاین آمده‌اید؟",
  "Light": "روشن", "Dark": "تیره", "Color theme": "پوسته رنگی",
  "Your profile": "پروفایل شما", Account: "حساب", "Profile photo": "تصویر پروفایل",
  "Choose image": "انتخاب تصویر", Remove: "حذف", Biography: "درباره من",
  "Save profile": "ذخیره پروفایل", "Saving…": "در حال ذخیره…", "Delete account": "حذف حساب",
  "Permanently delete account": "حذف دائمی حساب", "Deleting…": "در حال حذف…",
  "Search people": "جست‌وجوی کاربران", Messages: "پیام‌ها", People: "کاربران",
  Chat: "گفت‌وگو", "No conversations yet": "هنوز گفت‌وگویی ندارید", "No people found": "کاربری پیدا نشد",
  "Choose a conversation": "یک گفت‌وگو انتخاب کنید", "Write a message…": "پیام بنویسید…",
  "Send message": "ارسال پیام", "Load older messages": "نمایش پیام‌های قدیمی", "Loading…": "در حال بارگذاری…",
  "Retry connection": "تلاش دوباره", "Sign out": "خروج", "Open profile": "باز کردن پروفایل",
  "Developed by": "توسعه داده شده توسط",
  "Try another username or display name.": "نام کاربری یا نام نمایشی دیگری را امتحان کنید.",
  "Search for someone above to start your first chat.": "برای شروع اولین گفت‌وگو، کاربری را جست‌وجو کنید.",
  "A quiet start": "شروعی آرام", "Send the first message.": "اولین پیام را ارسال کنید.",
  "Message deleted": "پیام حذف شده", Retry: "تلاش دوباره", "Sending…": "در حال ارسال…", Read: "خوانده شد",
  "Back to conversations": "بازگشت به گفت‌وگوها", online: "آنلاین", "typing…": "در حال نوشتن…",
  "Select a chat from the sidebar or search for someone new.": "یک گفت‌وگو را انتخاب کنید یا کاربر جدیدی جست‌وجو کنید.",
  "Update how people see you in Online Chat.": "اطلاعاتی را که دیگران در گفت‌وگوی آنلاین می‌بینند ویرایش کنید.",
  "Choose a PNG, JPG, WebP, or GIF image smaller than 500 KB.": "یک تصویر PNG، JPG، WebP یا GIF کوچک‌تر از ۵۰۰ کیلوبایت انتخاب کنید.",
  "Your identity will be anonymized. Message history remains for other conversation members. This cannot be undone.": "هویت شما ناشناس می‌شود و تاریخچه پیام‌ها برای دیگران باقی می‌ماند. این کار قابل بازگشت نیست.",
  "Type DELETE to confirm": "برای تأیید DELETE را وارد کنید",
  "Switch to light theme": "تغییر به پوسته روشن", "Switch to dark theme": "تغییر به پوسته تیره",
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const storageKey = "online-chat:language:v1";

function applyLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const initial: Language = localStorage.getItem(storageKey) === "fa" ? "fa" : "en";
    queueMicrotask(() => setLanguageState(initial));
    applyLanguage(initial);
  }, []);

  function setLanguage(next: Language) {
    localStorage.setItem(storageKey, next);
    setLanguageState(next);
    applyLanguage(next);
  }

  const value = useMemo(() => ({ language, setLanguage, t: (text: string) => language === "fa" ? persian[text] ?? text : text }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
