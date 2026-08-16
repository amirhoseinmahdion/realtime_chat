"use client";

import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { useLanguage } from "@/providers/language-provider";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { t } = useLanguage();
  return (
    <main className="auth-page min-h-screen lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section className="auth-aside relative hidden min-h-screen overflow-hidden border-r border-white/8 px-12 py-10 lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(15,23,42,.25),rgba(30,41,59,.08))]" />
        <div className="absolute -left-20 top-1/4 size-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 size-80 rounded-full bg-sky-400/8 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><BrandMark /><span className="text-lg font-semibold tracking-tight">{t("Online Chat")}</span></div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{t("Live conversations")}</span>
        </div>

        <div className="relative my-auto grid items-center gap-10 xl:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-teal-300">{t("Simple. Fast. Together.")}</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-white xl:text-6xl">{t("Your people are only one message away.")}</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">{t("Search, connect, and continue every conversation in a focused space built for real-time chat.")}</p>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-teal-300" />{t("Instant delivery")}</span>
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-sky-400" />{t("Live presence")}</span>
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-indigo-400" />{t("Conversation history")}</span>
            </div>
          </div>

          <div aria-label="Chat preview" className="hidden rounded-[2rem] border border-white/10 bg-slate-950/30 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl xl:block">
            <div className="flex items-center gap-3 border-b border-white/8 pb-4"><span className="relative grid size-10 place-items-center rounded-full bg-indigo-400/20 text-sm font-bold text-indigo-200">AM<span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-slate-900 bg-emerald-400" /></span><div><p className="text-sm font-semibold text-white">Alex Morgan</p><p className="text-xs text-emerald-400">online now</p></div></div>
            <div className="space-y-3 py-5"><div className="max-w-[82%] rounded-2xl rounded-bl-md bg-white/7 px-4 py-3 text-sm leading-5 text-slate-300">Are we still on for the project call?</div><div className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-teal-300 px-4 py-3 text-sm font-medium text-slate-950">Absolutely — I’ll send the notes now.</div><p className="pr-2 text-right text-[10px] text-slate-500">Delivered just now</p></div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-xs text-slate-500"><span className="flex-1">Write a message…</span><span className="grid size-8 place-items-center rounded-xl bg-teal-300 text-slate-950">↗</span></div>
          </div>
        </div>

        <p className="relative text-xs text-slate-600">{t("Private by design. Ready whenever you are.")}</p>
      </section>

      <section className="auth-main flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center gap-3 lg:hidden">
          <BrandMark />
          <span className="text-lg font-semibold tracking-tight">{t("Online Chat")}</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="animate-fade-up w-full max-w-[440px]">{children}</div>
        </div>
        <div className="text-center text-xs leading-5 text-slate-600">
          <p>By continuing, you agree to keep conversations respectful.</p>
          <p className="mt-1.5">
            {t("Developed by")}{" "}
            <a className="font-semibold text-teal-300 transition hover:text-teal-200 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300" href="https://github.com/amirhoseinmahdion" rel="noreferrer" target="_blank">
              Amirhosein Mahdiyon
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
