"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/providers/auth-provider";

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, router, user]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    router.replace("/login");
  }

  if (isLoading || !user) {
    return (
      <main className="grid min-h-screen place-items-center" role="status">
        <span className="size-7 animate-spin rounded-full border-2 border-teal-300/20 border-t-teal-300" />
        <span className="sr-only">Loading chat</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 backdrop-blur sm:px-5">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-sm font-semibold">EchoLine</p>
            <p className="text-xs text-slate-500">@{user.username}</p>
          </div>
        </div>
        <button className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white disabled:opacity-50" disabled={isLoggingOut} onClick={handleLogout} type="button">
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-3xl place-items-center text-center">
        <div className="animate-fade-up">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl border border-teal-300/15 bg-teal-300/8 text-teal-300">
            <svg aria-hidden="true" className="size-7" fill="none" viewBox="0 0 24 24">
              <path d="M8 12h8M8 8h5m-6 9.2L3.8 19l.9-3.7A8 8 0 1 1 7 17.2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
            </svg>
          </span>
          <p className="mt-6 text-sm font-medium text-teal-300">You&apos;re in, {user.displayName}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your conversations will live here.</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400">Authentication is connected. User search and real-time conversations arrive in the next project phase.</p>
        </div>
      </section>
    </main>
  );
}
