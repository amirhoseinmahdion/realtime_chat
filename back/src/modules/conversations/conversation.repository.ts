import { randomUUID } from "node:crypto";

import type { ChatDatabase } from "../../database/database.js";
import { HttpError } from "../../errors/http-error.js";

interface ConversationRow {
  id: string;
  type: "direct" | "group";
  title: string | null;
  created_at: string;
  updated_at: string;
  other_user_id: string | null;
  other_username: string | null;
  other_display_name: string | null;
  other_avatar_url: string | null;
  last_message_id: string | null;
  last_message_content: string | null;
  last_message_sender_id: string | null;
  last_message_created_at: string | null;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_username: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class ConversationRepository {
  constructor(private readonly database: ChatDatabase) {}

  createOrFindDirect(currentUserId: string, otherUserId: string) {
    if (currentUserId === otherUserId) {
      throw new HttpError(400, "VALIDATION_ERROR", "You cannot start a conversation with yourself");
    }
    if (!this.database.prepare("SELECT 1 FROM users WHERE id = ?").get(otherUserId)) {
      throw new HttpError(404, "USER_NOT_FOUND", "User not found");
    }

    const [lowId, highId] = [currentUserId, otherUserId].sort();
    const existing = this.database
      .prepare("SELECT conversation_id FROM direct_conversations WHERE user_low_id = ? AND user_high_id = ?")
      .get(lowId, highId) as { conversation_id: string } | undefined;
    if (existing) return { conversation: this.getForMember(existing.conversation_id, currentUserId), created: false };

    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const create = this.database.transaction(() => {
      this.database
        .prepare("INSERT INTO conversations (id, type, created_by, created_at, updated_at) VALUES (?, 'direct', ?, ?, ?)")
        .run(id, currentUserId, timestamp, timestamp);
      const addMember = this.database.prepare(
        "INSERT INTO conversation_members (conversation_id, user_id, joined_at) VALUES (?, ?, ?)",
      );
      addMember.run(id, currentUserId, timestamp);
      addMember.run(id, otherUserId, timestamp);
      this.database
        .prepare("INSERT INTO direct_conversations (conversation_id, user_low_id, user_high_id) VALUES (?, ?, ?)")
        .run(id, lowId, highId);
    });

    try {
      create();
    } catch (error) {
      const raced = this.database
        .prepare("SELECT conversation_id FROM direct_conversations WHERE user_low_id = ? AND user_high_id = ?")
        .get(lowId, highId) as { conversation_id: string } | undefined;
      if (!raced) throw error;
      return { conversation: this.getForMember(raced.conversation_id, currentUserId), created: false };
    }

    return { conversation: this.getForMember(id, currentUserId), created: true };
  }

  listForMember(userId: string) {
    return this.queryConversations(userId).map(mapConversation);
  }

  getForMember(conversationId: string, userId: string) {
    const row = this.queryConversations(userId, conversationId)[0];
    if (!row) throw new HttpError(404, "CONVERSATION_NOT_FOUND", "Conversation not found");
    return mapConversation(row);
  }

  getMessages(conversationId: string, userId: string, limit: number, cursor?: string) {
    this.getForMember(conversationId, userId);

    let cursorRow: { created_at: string; id: string } | undefined;
    if (cursor) {
      cursorRow = this.database
        .prepare("SELECT created_at, id FROM messages WHERE id = ? AND conversation_id = ?")
        .get(cursor, conversationId) as { created_at: string; id: string } | undefined;
      if (!cursorRow) throw new HttpError(400, "INVALID_CURSOR", "Message cursor is invalid");
    }

    const params: unknown[] = [conversationId];
    let cursorSql = "";
    if (cursorRow) {
      cursorSql = "AND (m.created_at < ? OR (m.created_at = ? AND m.id < ?))";
      params.push(cursorRow.created_at, cursorRow.created_at, cursorRow.id);
    }
    params.push(limit + 1);

    const rows = this.database
      .prepare(
        `SELECT m.*, u.username AS sender_username
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.conversation_id = ? ${cursorSql}
         ORDER BY m.created_at DESC, m.id DESC
         LIMIT ?`,
      )
      .all(...params) as MessageRow[];
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);

    return {
      messages: page.map(mapMessage).reverse(),
      nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
    };
  }

  private queryConversations(userId: string, conversationId?: string): ConversationRow[] {
    const idFilter = conversationId ? "AND c.id = ?" : "";
    return this.database
      .prepare(
        `SELECT c.id, c.type, c.title, c.created_at, c.updated_at,
          other.id AS other_user_id, other.username AS other_username,
          other.display_name AS other_display_name, other.avatar_url AS other_avatar_url,
          last.id AS last_message_id, last.content AS last_message_content,
          last.sender_id AS last_message_sender_id, last.created_at AS last_message_created_at
         FROM conversations c
         JOIN conversation_members mine ON mine.conversation_id = c.id AND mine.user_id = ?
         LEFT JOIN conversation_members other_member
           ON other_member.conversation_id = c.id AND other_member.user_id != ? AND c.type = 'direct'
         LEFT JOIN users other ON other.id = other_member.user_id
         LEFT JOIN messages last ON last.id = (
           SELECT id FROM messages WHERE conversation_id = c.id
           ORDER BY created_at DESC, id DESC LIMIT 1
         )
         WHERE 1 = 1 ${idFilter}
         ORDER BY COALESCE(last.created_at, c.updated_at) DESC, c.id DESC`,
      )
      .all(...(conversationId ? [userId, userId, conversationId] : [userId, userId])) as ConversationRow[];
  }
}

function mapConversation(row: ConversationRow) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    participant: row.other_user_id
      ? {
          id: row.other_user_id,
          username: row.other_username,
          displayName: row.other_display_name,
          avatarUrl: row.other_avatar_url,
        }
      : null,
    lastMessage: row.last_message_id
      ? {
          id: row.last_message_id,
          content: row.last_message_content,
          senderId: row.last_message_sender_id,
          createdAt: row.last_message_created_at,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: MessageRow) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: { id: row.sender_id, username: row.sender_username },
    content: row.deleted_at ? null : row.content,
    type: row.type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
