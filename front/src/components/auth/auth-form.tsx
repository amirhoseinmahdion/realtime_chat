"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { translateAuthError, useLanguage } from "@/providers/language-provider";

type AuthMode = "login" | "signup";

interface FormErrors {
  displayName?: string;
  username?: string;
  password?: string;
}

const inputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-teal-300/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-teal-300/8 disabled:cursor-not-allowed disabled:opacity-60";

export function AuthForm({ mode }: Readonly<{ mode: AuthMode }>) {
  const router = useRouter();
  const { user, isLoading: isSessionLoading, login, signup } = useAuth();
  const { language, t } = useLanguage();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  useEffect(() => {
    if (!isSessionLoading && user) router.replace("/chat");
  }, [isSessionLoading, router, user]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    const normalizedUsername = username.trim();

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
      nextErrors.username = "Use 3–30 letters, numbers, or underscores.";
    }
    if (password.length < 8 || password.length > 72) {
      nextErrors.password = "Password must be between 8 and 72 characters.";
    }
    if (isSignup && displayName.trim().length > 50) {
      nextErrors.displayName = "Display name must be 50 characters or fewer.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isSignup) {
        await signup({ username: username.trim(), password, displayName: displayName.trim() });
      } else {
        await login(username.trim(), password);
      }
      router.replace("/chat");
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSessionLoading || user) {
    return <AuthLoading label={t("Loading your session")} />;
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-teal-300">
          {t(isSignup ? "Start chatting today" : "Good to see you again")}
        </p>
        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          {t(isSignup ? "Create your Online Chat account" : "Continue to Online Chat")}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {isSignup
            ? t("Create your profile, find people, and start a conversation in seconds.")
            : t("Sign in to see your conversations and reconnect with your people.")}
        </p>
      </div>

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {isSignup ? (
          <Field error={errors.displayName ? t(errors.displayName) : undefined} label={t("Display name")} optional optionalLabel={t("Optional")}>
            <input
              autoComplete="name"
              className={inputClassName}
              disabled={isSubmitting}
              id="displayName"
              maxLength={50}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={t("How people will see you")}
              value={displayName}
            />
          </Field>
        ) : null}

        <Field error={errors.username ? t(errors.username) : undefined} inputId="username" label={t("Username")}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-600">@</span>
            <input
              aria-invalid={Boolean(errors.username)}
              autoCapitalize="none"
              autoComplete="username"
              className={`${inputClassName} pl-8`}
              disabled={isSubmitting}
              id="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="your_username"
              spellCheck={false}
              value={username}
            />
          </div>
        </Field>

        <Field error={errors.password ? t(errors.password) : undefined} inputId="password" label={t("Password")}>
          <div className="relative">
            <input
              aria-invalid={Boolean(errors.password)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className={`${inputClassName} pr-16`}
              disabled={isSubmitting}
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t(isSignup ? "At least 8 characters" : "Your password")}
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              className="absolute inset-y-0 right-3 px-2 text-xs font-semibold text-slate-500 transition hover:text-slate-200 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {t(showPassword ? "Hide" : "Show")}
            </button>
          </div>
        </Field>

        {serverError ? (
          <div aria-live="polite" className="rounded-xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm leading-5 text-rose-300" role="alert">
            {translateAuthError(serverError, language)}
          </div>
        ) : null}

        <button
          className="flex h-12 w-full items-center justify-center rounded-xl bg-teal-300 px-5 text-sm font-bold text-slate-950 shadow-[0_14px_35px_rgba(45,212,191,0.14)] transition hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-300/25 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-slate-900/25 border-t-slate-900" />
              {t(isSignup ? "Creating account…" : "Signing in…")}
            </span>
          ) : isSignup ? (
            t("Create account")
          ) : (
            t("Sign in")
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        {t(isSignup ? "Already have an account?" : "New to Online Chat?")}{" "}
        <Link className="font-semibold text-teal-300 transition hover:text-teal-200 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300" href={isSignup ? "/login" : "/signup"}>
          {t(isSignup ? "Sign in" : "Create account")}
        </Link>
      </p>
    </div>
  );
}

function Field({ children, error, inputId, label, optional, optionalLabel }: Readonly<{ children: React.ReactNode; error?: string; inputId?: string; label: string; optional?: boolean; optionalLabel?: string }>) {
  return (
    <div>
      <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-200" htmlFor={inputId ?? "displayName"}>
        {label}
        {optional ? <span className="text-xs font-normal text-slate-600">{optionalLabel}</span> : null}
      </label>
      {children}
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

function AuthLoading({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex min-h-56 items-center justify-center" role="status">
      <span className="size-6 animate-spin rounded-full border-2 border-teal-300/20 border-t-teal-300" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
