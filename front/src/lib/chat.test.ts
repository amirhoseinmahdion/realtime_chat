import { describe, expect, it } from "vitest";

import { mergeConversations, mergeMessages, replaceOptimisticMessage } from "./chat";
import type { Conversation, Message } from "@/types/chat";

describe("chat data merging", () => {
  it("deduplicates conversations and orders them by latest activity", () => {
    const older = conversation("older", "2026-08-16T10:00:00.000Z");
    const newer = conversation("newer", "2026-08-16T11:00:00.000Z");
    const updatedOlder = { ...older, updatedAt: "2026-08-16T12:00:00.000Z" };

    const result = mergeConversations([older, newer], [updatedOlder]);

    expect(result).toHaveLength(2);
    expect(result.map(({ id }) => id)).toEqual(["older", "newer"]);
    expect(result[0]?.updatedAt).toBe("2026-08-16T12:00:00.000Z");
  });

  it("deduplicates messages and restores chronological order", () => {
    const latest = message("latest", "2026-08-16T12:00:00.000Z");
    const earliest = message("earliest", "2026-08-16T10:00:00.000Z");

    const result = mergeMessages([latest], [earliest, latest]);

    expect(result.map(({ id }) => id)).toEqual(["earliest", "latest"]);
  });

  it("reconciles an optimistic client message with its saved server message", () => {
    const optimistic = {
      ...message("client:one", "2026-08-16T10:00:00.000Z"),
      clientId: "one",
      delivery: "sending" as const,
    };
    const saved = { ...message("server-one", "2026-08-16T10:00:01.000Z"), delivery: "sent" as const };

    const result = replaceOptimisticMessage([optimistic], "one", saved);

    expect(result).toEqual([saved]);
  });
});

function conversation(id: string, updatedAt: string): Conversation {
  return {
    id,
    type: "direct",
    title: null,
    participant: null,
    lastMessage: null,
    createdAt: updatedAt,
    updatedAt,
  };
}

function message(id: string, createdAt: string): Message {
  return {
    id,
    conversationId: "conversation",
    sender: { id: "user", username: "user" },
    content: id,
    type: "text",
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  };
}
