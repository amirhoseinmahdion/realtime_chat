import type { Server as HttpServer } from "node:http";

import { Server, type Socket } from "socket.io";

import { HttpError } from "../errors/http-error.js";
import type { AuthService } from "../modules/auth/auth.service.js";
import type { StoredUser } from "../modules/auth/auth.types.js";
import type { ConversationRepository } from "../modules/conversations/conversation.repository.js";

interface AuthenticatedSocket extends Socket {
  data: { user: StoredUser; token: string };
}

interface SendInput {
  conversationId?: unknown;
  content?: unknown;
  clientId?: unknown;
}

type Ack = (result: Record<string, unknown>) => void;

export function createSocketServer(
  httpServer: HttpServer,
  options: {
    clientUrl: string;
    authService: AuthService;
    conversations: ConversationRepository;
    messageRateLimit?: { limit: number; windowMs: number };
  },
): Server {
  const io = new Server(httpServer, {
    cors: { origin: options.clientUrl, credentials: true },
  });
  const onlineUsers = new Map<string, number>();
  const messageLimits = new Map<string, { count: number; resetAt: number }>();
  const messageRateLimit = options.messageRateLimit ?? { limit: 30, windowMs: 10_000 };

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (typeof token !== "string") throw new Error("Token is required");
      (socket as AuthenticatedSocket).data = {
        user: options.authService.authenticate(token),
        token,
      };
      next();
    } catch {
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const user = socket.data.user;
    const requireActiveUser = () => options.authService.authenticate(socket.data.token);
    socket.join(`user:${user.id}`);
    onlineUsers.set(user.id, (onlineUsers.get(user.id) ?? 0) + 1);
    io.emit("presence:changed", { userId: user.id, online: true });

    socket.on("conversation:join", (conversationId: unknown, acknowledge?: Ack) => {
      try {
        requireActiveUser();
      } catch {
        acknowledge?.({ ok: false, code: "UNAUTHORIZED" });
        socket.disconnect(true);
        return;
      }
      if (typeof conversationId !== "string" || !options.conversations.isMember(conversationId, user.id)) {
        acknowledge?.({ ok: false, code: "CONVERSATION_NOT_FOUND" });
        return;
      }
      socket.join(`conversation:${conversationId}`);
      acknowledge?.({ ok: true });
    });

    socket.on("message:send", (input: SendInput, acknowledge?: Ack) => {
      try {
        requireActiveUser();
        const now = Date.now();
        const previousLimit = messageLimits.get(user.id);
        const currentLimit = !previousLimit || previousLimit.resetAt <= now
          ? { count: 0, resetAt: now + messageRateLimit.windowMs }
          : previousLimit;
        currentLimit.count += 1;
        messageLimits.set(user.id, currentLimit);
        if (currentLimit.count > messageRateLimit.limit) {
          throw new HttpError(429, "RATE_LIMITED", "Too many messages. Please slow down");
        }
        if (typeof input.conversationId !== "string" || typeof input.content !== "string") {
          throw new HttpError(400, "VALIDATION_ERROR", "Invalid message payload");
        }
        const message = options.conversations.createMessage(
          input.conversationId,
          user.id,
          input.content,
        );
        const notificationRooms = [
          `conversation:${input.conversationId}`,
          ...options.conversations
            .getMemberIds(input.conversationId)
            .map((memberId) => `user:${memberId}`),
        ];
        io.to(notificationRooms).emit("message:created", {
          message,
          clientId: typeof input.clientId === "string" ? input.clientId : null,
        });
        acknowledge?.({ ok: true, message });
      } catch (error) {
        const code = error instanceof HttpError ? error.code : "MESSAGE_FAILED";
        acknowledge?.({ ok: false, code });
      }
    });

    socket.on("typing:change", (input: { conversationId?: unknown; typing?: unknown }) => {
      try {
        requireActiveUser();
      } catch {
        socket.disconnect(true);
        return;
      }
      if (
        typeof input.conversationId === "string" &&
        typeof input.typing === "boolean" &&
        options.conversations.isMember(input.conversationId, user.id)
      ) {
        socket.to(`conversation:${input.conversationId}`).emit("typing:changed", {
          conversationId: input.conversationId,
          userId: user.id,
          typing: input.typing,
        });
      }
    });

    socket.on(
      "message:read",
      (input: { conversationId?: unknown; messageId?: unknown }, acknowledge?: Ack) => {
        try {
          requireActiveUser();
          if (typeof input.conversationId !== "string" || typeof input.messageId !== "string") {
            throw new HttpError(400, "VALIDATION_ERROR", "Invalid read receipt");
          }
          options.conversations.markRead(input.conversationId, user.id, input.messageId);
          socket.to(`conversation:${input.conversationId}`).emit("message:read", {
            conversationId: input.conversationId,
            messageId: input.messageId,
            userId: user.id,
          });
          acknowledge?.({ ok: true });
        } catch (error) {
          acknowledge?.({
            ok: false,
            code: error instanceof HttpError ? error.code : "READ_RECEIPT_FAILED",
          });
        }
      },
    );

    socket.on("disconnect", () => {
      const remaining = (onlineUsers.get(user.id) ?? 1) - 1;
      if (remaining <= 0) {
        onlineUsers.delete(user.id);
        io.emit("presence:changed", { userId: user.id, online: false });
      } else {
        onlineUsers.set(user.id, remaining);
      }
    });
  });

  return io;
}
