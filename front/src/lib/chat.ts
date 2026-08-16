import type { Conversation, Message } from "@/types/chat";

export function mergeConversations(current: Conversation[], incoming: Conversation[]): Conversation[] {
  const byId = new Map(current.map((conversation) => [conversation.id, conversation]));
  for (const conversation of incoming) byId.set(conversation.id, conversation);
  return [...byId.values()].sort(
    (left, right) => conversationActivity(right) - conversationActivity(left),
  );
}

export function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function conversationActivity(conversation: Conversation): number {
  return new Date(conversation.lastMessage?.createdAt ?? conversation.updatedAt).getTime();
}
