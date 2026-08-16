"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ChatShell } from "@/components/chat/chat-shell";
import { useAuth } from "@/providers/auth-provider";

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <main className="grid min-h-screen place-items-center" role="status">
        <span className="size-7 animate-spin rounded-full border-2 border-teal-300/20 border-t-teal-300" />
        <span className="sr-only">Loading chat</span>
      </main>
    );
  }

  return <ChatShell currentUser={user} />;
}
