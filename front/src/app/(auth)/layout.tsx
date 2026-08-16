import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";

const highlights = [
  "Private conversations that stay in sync",
  "Fast search across the people you know",
  "A calm space designed for real connection",
];

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="auth-page min-h-screen lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section className="auth-aside relative hidden min-h-screen overflow-hidden border-r border-white/8 px-12 py-10 lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,.2),rgba(8,47,73,.18))]" />
        <div className="absolute -left-24 top-1/3 size-80 rounded-full bg-teal-400/8 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <BrandMark />
          <span className="text-lg font-semibold tracking-tight">EchoLine</span>
        </div>

        <div className="relative my-auto max-w-xl pb-16">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-teal-300">
            Conversation, simplified
          </p>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-6xl">
            Messages feel better when nothing gets in the way.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
            Find your people, pick up where you left off, and keep every conversation close.
          </p>

          <ul className="mt-10 space-y-4" aria-label="Product benefits">
            {highlights.map((highlight) => (
              <li className="flex items-center gap-3 text-sm text-slate-300" key={highlight}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-teal-300/20 bg-teal-300/8 text-teal-300">
                  <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none">
                    <path d="m4 8 2.5 2.5L12 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-600">Built for thoughtful conversations.</p>
      </section>

      <section className="auth-main flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center gap-3 lg:hidden">
          <BrandMark />
          <span className="text-lg font-semibold tracking-tight">EchoLine</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="animate-fade-up w-full max-w-[440px]">{children}</div>
        </div>
        <p className="text-center text-xs leading-5 text-slate-600">
          By continuing, you agree to keep conversations respectful.
        </p>
      </section>
    </main>
  );
}
