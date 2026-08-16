"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import { isDeletionConfirmed, validateProfile } from "@/lib/profile";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/providers/auth-provider";
import type { User } from "@/types/auth";

export function ProfilePanel({ onClose, user }: Readonly<{ onClose: () => void; user: User }>) {
  const router = useRouter();
  const { deleteAccount, updateProfile } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<{ kind: "error" | "success"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = {
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || null,
    };
    const validationError = validateProfile(input);
    if (validationError) {
      setStatus({ kind: "error", message: validationError });
      return;
    }
    setIsSaving(true);
    setStatus(null);
    try {
      await updateProfile(input);
      setStatus({ kind: "success", message: "Profile saved. Your other sessions were signed out." });
    } catch (error) {
      setStatus({ kind: "error", message: getMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  function handleAvatarFile(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setStatus({ kind: "error", message: "Choose a PNG, JPG, WebP, or GIF image." });
      return;
    }
    if (file.size > 192 * 1024) {
      setStatus({ kind: "error", message: "Avatar images must be smaller than 192 KB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setStatus(null);
      }
    };
    reader.onerror = () => setStatus({ kind: "error", message: "The selected image could not be read." });
    reader.readAsDataURL(file);
  }

  async function handleDelete() {
    if (!isDeletionConfirmed(confirmation)) return;
    setIsDeleting(true);
    setStatus(null);
    try {
      await deleteAccount(confirmation);
      router.replace("/signup");
    } catch (error) {
      setStatus({ kind: "error", message: getMessage(error) });
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section aria-labelledby="profile-title" aria-modal="true" className="profile-panel max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/50 sm:max-h-[calc(100dvh-3rem)] sm:p-7" role="dialog">
        <header className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Account</p><h2 className="mt-1 text-2xl font-semibold" id="profile-title">Your profile</h2><p className="mt-1 text-sm text-slate-500">Update how people see you in EchoLine.</p></div>
          <button aria-label="Close profile" className="grid size-10 place-items-center rounded-xl text-xl text-slate-400 hover:bg-white/5 hover:text-white" onClick={onClose} type="button">×</button>
        </header>

        <form className="mt-7 space-y-4" onSubmit={handleSave}>
          <div className="flex items-center gap-5 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <UserAvatar name={displayName || username || "User"} size="large" url={avatarUrl || null} />
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Profile photo</p><p className="mt-1 text-xs leading-5 text-slate-500">Choose a PNG, JPG, WebP, or GIF smaller than 192 KB.</p><div className="mt-3 flex flex-wrap gap-2"><label className="cursor-pointer rounded-xl bg-teal-300 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-teal-200"><input accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => handleAvatarFile(event.target.files?.[0])} type="file" />Choose image</label>{avatarUrl ? <button className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5" onClick={() => setAvatarUrl("")} type="button">Remove</button> : null}</div></div>
          </div>
          <ProfileField label="Username" maxLength={30} onChange={setUsername} value={username} />
          <ProfileField label="Display name" maxLength={50} onChange={setDisplayName} value={displayName} />
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Biography</span><textarea className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-3 text-sm outline-none focus:border-teal-300/50" maxLength={160} onChange={(event) => setBio(event.target.value)} value={bio} /><span className="mt-1 block text-right text-xs text-slate-600">{bio.length}/160</span></label>
          {status ? <p className={`rounded-xl border px-3 py-2.5 text-sm ${status.kind === "error" ? "border-rose-400/25 bg-rose-400/10 text-rose-300" : "border-teal-300/25 bg-teal-300/10 text-teal-200"}`} role={status.kind === "error" ? "alert" : "status"}>{status.message}</p> : null}
          <button className="h-11 w-full rounded-xl bg-teal-300 text-sm font-bold text-slate-950 transition hover:bg-teal-200 disabled:opacity-50" disabled={isSaving || isDeleting} type="submit">{isSaving ? "Saving…" : "Save profile"}</button>
        </form>

        <section className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-400/[0.055] p-4">
          <h3 className="font-semibold text-rose-200">Delete account</h3><p className="mt-1 text-sm leading-5 text-slate-400">Your identity will be anonymized. Message history remains for other conversation members. This cannot be undone.</p>
          <label className="mt-4 block"><span className="mb-2 block text-xs font-medium text-slate-400">Type <strong className="text-rose-300">DELETE</strong> to confirm</span><input autoComplete="off" className="h-10 w-full rounded-xl border border-rose-400/20 bg-slate-950/30 px-3 text-sm outline-none focus:border-rose-400/60" onChange={(event) => setConfirmation(event.target.value)} value={confirmation} /></label>
          <button className="mt-3 h-10 w-full rounded-xl bg-rose-500 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35" disabled={!isDeletionConfirmed(confirmation) || isDeleting || isSaving} onClick={handleDelete} type="button">{isDeleting ? "Deleting…" : "Permanently delete account"}</button>
        </section>
      </section>
    </div>
  );
}

function ProfileField({ label, maxLength, onChange, placeholder, type = "text", value }: Readonly<{ label: string; maxLength: number; onChange: (value: string) => void; placeholder?: string; type?: string; value: string }>) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">{label}</span><input className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-sm outline-none focus:border-teal-300/50" maxLength={maxLength} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} /></label>;
}

function getMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}
