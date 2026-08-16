export interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}

export interface ConversationParticipant {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  title: string | null;
  participant: ConversationParticipant | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: { id: string; username: string };
  content: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  clientId?: string;
  delivery?: "sending" | "failed" | "sent";
}

export interface MessagePage {
  messages: Message[];
  nextCursor: string | null;
}
