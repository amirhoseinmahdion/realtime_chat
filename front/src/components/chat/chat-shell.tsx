"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { ApiError } from "@/lib/api";
import { mergeConversations, mergeMessages } from "@/lib/chat";
import { useAuth } from "@/providers/auth-provider";
import type { User } from "@/types/auth";
import type { Conversation, Message, MessagePage, SearchUser } from "@/types/chat";

export function ChatShell({ currentUser }: Readonly<{ currentUser: User }>) {
  const router = useRouter();
  const { authorizedRequest, logout } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);
  const [error, setError] = useState("");

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      setError("");
      try {
        const page = await authorizedRequest<MessagePage>(
          `/api/conversations/${conversationId}/messages?limit=30`,
        );
        setMessages(page.messages);
        setNextCursor(page.nextCursor);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [authorizedRequest],
  );

  useEffect(() => {
    authorizedRequest<{ conversations: Conversation[] }>("/api/conversations")
      .then(({ conversations: loaded }) => {
        setConversations(mergeConversations([], loaded));
        const first = loaded[0];
        if (first) {
          setSelectedId(first.id);
          void loadMessages(first.id);
        }
      })
      .catch((requestError: unknown) => setError(getErrorMessage(requestError)))
      .finally(() => setIsLoadingConversations(false));
  }, [authorizedRequest, loadMessages]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      authorizedRequest<{ users: SearchUser[] }>(
        `/api/users/search?q=${encodeURIComponent(trimmedQuery)}&limit=12`,
      )
        .then(({ users }) => setSearchResults(users))
        .catch((requestError: unknown) => setError(getErrorMessage(requestError)))
        .finally(() => setIsSearching(false));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [authorizedRequest, query]);

  async function selectConversation(conversationId: string) {
    setSelectedId(conversationId);
    setMessages([]);
    setNextCursor(null);
    await loadMessages(conversationId);
  }

  async function startConversation(user: SearchUser) {
    setIsStartingChat(user.id);
    setError("");
    try {
      const result = await authorizedRequest<{ conversation: Conversation; created: boolean }>(
        "/api/conversations",
        { method: "POST", body: JSON.stringify({ userId: user.id }) },
      );
      setConversations((current) => mergeConversations(current, [result.conversation]));
      setQuery("");
      setSearchResults([]);
      await selectConversation(result.conversation.id);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsStartingChat(null);
    }
  }

  async function loadOlderMessages() {
    if (!selectedId || !nextCursor) return;
    setIsLoadingOlder(true);
    try {
      const page = await authorizedRequest<MessagePage>(
        `/api/conversations/${selectedId}/messages?limit=30&cursor=${encodeURIComponent(nextCursor)}`,
      );
      setMessages((current) => mergeMessages(page.messages, current));
      setNextCursor(page.nextCursor);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingOlder(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function updateQuery(value: string) {
    setQuery(value);
    setError("");
    if (!value.trim()) setSearchResults([]);
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#070b14] p-0 sm:p-3 lg:p-5">
      <div className="mx-auto flex h-full max-w-[1500px] overflow-hidden border-white/10 bg-[#0a101c] shadow-2xl shadow-black/30 sm:rounded-3xl sm:border">
        <aside className={`${selectedId ? "hidden lg:flex" : "flex"} w-full shrink-0 flex-col border-r border-white/8 bg-[#0b1220] lg:w-[360px] xl:w-[400px]`}>
          <SidebarHeader currentUser={currentUser} onLogout={handleLogout} />
          <div className="border-b border-white/8 px-4 pb-4">
            <SearchBox isSearching={isSearching} onChange={updateQuery} query={query} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {query.trim() ? (
              <SearchResults isLoading={isSearching} onSelect={startConversation} pendingUserId={isStartingChat} users={searchResults} />
            ) : (
              <ConversationList conversations={conversations} isLoading={isLoadingConversations} onSelect={selectConversation} selectedId={selectedId} />
            )}
          </div>
        </aside>

        <section className={`${selectedId ? "flex" : "hidden lg:flex"} min-w-0 flex-1 flex-col bg-[#080e19]`}>
          {selectedConversation ? (
            <>
              <ConversationHeader conversation={selectedConversation} onBack={() => setSelectedId(null)} />
              {error ? <div className="mx-4 mt-3 rounded-xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-300" role="alert">{error}</div> : null}
              <MessageHistory currentUserId={currentUser.id} isLoading={isLoadingMessages} isLoadingOlder={isLoadingOlder} messages={messages} nextCursor={nextCursor} onLoadOlder={loadOlderMessages} />
              <ComposerPreview />
            </>
          ) : (
            <EmptyConversation />
          )}
        </section>
      </div>
    </main>
  );
}

function SidebarHeader({ currentUser, onLogout }: Readonly<{ currentUser: User; onLogout: () => void }>) {
  return <header className="flex items-center justify-between px-4 py-4 sm:px-5 sm:py-5"><div className="flex min-w-0 items-center gap-3"><BrandMark /><div className="min-w-0"><h1 className="truncate text-base font-semibold tracking-tight">EchoLine</h1><p className="truncate text-xs text-slate-500">@{currentUser.username}</p></div></div><button aria-label="Sign out" className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-white/5 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300" onClick={onLogout} title="Sign out" type="button"><LogoutIcon /></button></header>;
}

function SearchBox({ isSearching, onChange, query }: Readonly<{ isSearching: boolean; onChange: (value: string) => void; query: string }>) {
  return <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-600"><SearchIcon /></span><input aria-label="Search people" className="h-11 w-full rounded-xl border border-white/8 bg-white/[0.035] pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/40 focus:ring-4 focus:ring-teal-300/5" onChange={(event) => onChange(event.target.value)} placeholder="Search people" type="search" value={query} />{isSearching ? <span className="absolute right-3.5 top-3.5 size-4 animate-spin rounded-full border-2 border-slate-600 border-t-teal-300" /> : null}</div>;
}

function ConversationList({ conversations, isLoading, onSelect, selectedId }: Readonly<{ conversations: Conversation[]; isLoading: boolean; onSelect: (id: string) => void; selectedId: string | null }>) {
  if (isLoading) return <ListSkeleton />;
  if (!conversations.length) return <SidebarEmpty title="No conversations yet" description="Search for someone above to start your first chat." />;
  return <div className="p-2" role="list"><p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">Messages</p>{conversations.map((conversation) => { const participant = conversation.participant; const label = participant?.displayName ?? conversation.title ?? "Conversation"; return <button className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${selectedId === conversation.id ? "bg-teal-300/9" : "hover:bg-white/[0.035]"}`} key={conversation.id} onClick={() => onSelect(conversation.id)} role="listitem" type="button"><Avatar name={label} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-slate-100">{label}</span><span className="shrink-0 text-[11px] text-slate-600">{formatShortTime(conversation.lastMessage?.createdAt ?? conversation.updatedAt)}</span></span><span className="mt-1 block truncate text-xs text-slate-500">{conversation.lastMessage?.content ?? `@${participant?.username ?? "new_chat"}`}</span></span></button>; })}</div>;
}

function SearchResults({ isLoading, onSelect, pendingUserId, users }: Readonly<{ isLoading: boolean; onSelect: (user: SearchUser) => void; pendingUserId: string | null; users: SearchUser[] }>) {
  if (isLoading && !users.length) return <ListSkeleton />;
  if (!users.length) return <SidebarEmpty title="No people found" description="Try another username or display name." />;
  return <div className="p-2" role="list"><p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">People</p>{users.map((user) => <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.035] disabled:opacity-60" disabled={pendingUserId === user.id} key={user.id} onClick={() => onSelect(user)} role="listitem" type="button"><Avatar name={user.displayName} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-100">{user.displayName}</span><span className="mt-0.5 block truncate text-xs text-slate-500">@{user.username}{user.bio ? ` · ${user.bio}` : ""}</span></span><span className="text-xs font-semibold text-teal-300">{pendingUserId === user.id ? "Opening…" : "Chat"}</span></button>)}</div>;
}

function ConversationHeader({ conversation, onBack }: Readonly<{ conversation: Conversation; onBack: () => void }>) {
  const name = conversation.participant?.displayName ?? conversation.title ?? "Conversation";
  return <header className="flex h-[73px] shrink-0 items-center gap-3 border-b border-white/8 px-4 sm:px-5"><button aria-label="Back to conversations" className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-white/5 lg:hidden" onClick={onBack} type="button"><BackIcon /></button><Avatar name={name} small /><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-white">{name}</h2><p className="truncate text-xs text-slate-500">@{conversation.participant?.username ?? "conversation"}</p></div></header>;
}

function MessageHistory({ currentUserId, isLoading, isLoadingOlder, messages, nextCursor, onLoadOlder }: Readonly<{ currentUserId: string; isLoading: boolean; isLoadingOlder: boolean; messages: Message[]; nextCursor: string | null; onLoadOlder: () => void }>) {
  if (isLoading) return <div className="flex flex-1 flex-col justify-end gap-3 p-5"><div className="h-12 w-2/5 animate-pulse rounded-2xl bg-white/5" /><div className="ml-auto h-16 w-1/2 animate-pulse rounded-2xl bg-teal-300/8" /></div>;
  return <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">{nextCursor ? <div className="mb-5 text-center"><button className="rounded-lg border border-white/8 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50" disabled={isLoadingOlder} onClick={onLoadOlder} type="button">{isLoadingOlder ? "Loading…" : "Load older messages"}</button></div> : null}{!messages.length ? <div className="grid h-full place-items-center text-center"><div><p className="text-sm font-semibold text-slate-300">A quiet start</p><p className="mt-1 text-xs text-slate-600">Your message history will appear here.</p></div></div> : <div className="space-y-2" role="log">{messages.map((message) => { const own = message.sender.id === currentUserId; return <div className={`flex ${own ? "justify-end" : "justify-start"}`} key={message.id}><div className={`max-w-[82%] rounded-2xl px-4 py-2.5 sm:max-w-[68%] ${own ? "rounded-br-md bg-teal-300 text-slate-950" : "rounded-bl-md border border-white/8 bg-white/[0.045] text-slate-200"}`}><p className="whitespace-pre-wrap break-words text-sm leading-5">{message.content ?? "Message deleted"}</p><p className={`mt-1 text-right text-[10px] ${own ? "text-slate-700" : "text-slate-600"}`}>{formatShortTime(message.createdAt)}</p></div></div>; })}</div>}</div>;
}

function ComposerPreview() { return <footer className="shrink-0 border-t border-white/8 p-3 sm:p-4"><div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.035] p-2 pl-4"><input aria-label="Message" className="min-w-0 flex-1 bg-transparent text-sm text-slate-500 outline-none placeholder:text-slate-600" disabled placeholder="Messaging arrives in the next phase" /><button aria-label="Send message" className="grid size-10 place-items-center rounded-xl bg-white/5 text-slate-600" disabled title="Sending is enabled in Feature 6" type="button"><SendIcon /></button></div></footer>; }
function EmptyConversation() { return <div className="grid flex-1 place-items-center px-6 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl border border-teal-300/15 bg-teal-300/8 text-teal-300"><ChatIcon /></span><h2 className="mt-5 text-xl font-semibold">Choose a conversation</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Select a chat from the sidebar or search for someone new.</p></div></div>; }
function SidebarEmpty({ description, title }: Readonly<{ description: string; title: string }>) { return <div className="px-8 py-16 text-center"><p className="text-sm font-semibold text-slate-300">{title}</p><p className="mt-2 text-xs leading-5 text-slate-600">{description}</p></div>; }
function ListSkeleton() { return <div className="space-y-2 p-4" aria-label="Loading conversations" role="status">{[1, 2, 3].map((item) => <div className="flex animate-pulse items-center gap-3 py-2" key={item}><span className="size-11 rounded-full bg-white/5" /><span className="flex-1"><span className="block h-3 w-2/5 rounded bg-white/5" /><span className="mt-2 block h-2.5 w-3/4 rounded bg-white/[0.035]" /></span></div>)}</div>; }
function Avatar({ name, small = false }: Readonly<{ name: string; small?: boolean }>) { return <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-300/25 to-sky-400/15 font-bold text-teal-200 ring-1 ring-white/10 ${small ? "size-9 text-xs" : "size-11 text-sm"}`}>{initials(name)}</span>; }
function initials(name: string): string { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"; }
function formatShortTime(value: string): string { const date = new Date(value); const now = new Date(); if (date.toDateString() === now.toDateString()) return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date); return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date); }
function getErrorMessage(error: unknown): string { return error instanceof ApiError ? error.message : "Something went wrong. Please try again."; }
function SearchIcon() { return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" /><path d="m13 13 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>; }
function LogoutIcon() { return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20"><path d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8m4-3 3-3-3-3m3 3H7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>; }
function BackIcon() { return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 20 20"><path d="m12 5-5 5 5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>; }
function SendIcon() { return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20"><path d="m3 4 14 6-14 6 2-6-2-6Zm2 6h12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>; }
function ChatIcon() { return <svg aria-hidden="true" className="size-7" fill="none" viewBox="0 0 24 24"><path d="M8 12h8M8 8h5m-6 9.2L3.8 19l.9-3.7A8 8 0 1 1 7 17.2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>; }
