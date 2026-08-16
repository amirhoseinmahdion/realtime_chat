import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, describe, it } from "node:test";

import { io as createClient, type Socket as ClientSocket } from "socket.io-client";
import type { Express } from "express";
import request from "supertest";

import { createApp } from "../src/app.js";
import { createDatabase, type ChatDatabase } from "../src/database/database.js";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { UserRepository } from "../src/modules/auth/user.repository.js";
import { ConversationRepository } from "../src/modules/conversations/conversation.repository.js";
import { createSocketServer } from "../src/socket/socket.js";

describe("real-time messaging", () => {
  let database: ChatDatabase;
  let app: Express;
  let baseUrl: string;
  let closeServer: () => Promise<void>;
  let alex: { id: string; token: string };
  let blair: { id: string; token: string };
  let conversationId: string;
  let conversations: ConversationRepository;

  before(async () => {
    database = createDatabase(":memory:");
    const authService = new AuthService(new UserRepository(database), "socket-test-secret");
    conversations = new ConversationRepository(database);
    app = createApp({
      clientUrl: "http://localhost:3000",
      database,
      jwtSecret: "socket-test-secret",
      authService,
      conversationRepository: conversations,
    });
    alex = await signup(app, "socket_alex");
    blair = await signup(app, "socket_blair");
    const direct = conversations.createOrFindDirect(alex.id, blair.id);
    conversationId = direct.conversation.id;

    const httpServer = createServer(app);
    const io = createSocketServer(httpServer, {
      clientUrl: "http://localhost:3000",
      authService,
      conversations,
      messageRateLimit: { limit: 1, windowMs: 60_000 },
    });
    await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const address = httpServer.address();
    if (!address || typeof address === "string") throw new Error("Test server failed to listen");
    baseUrl = `http://127.0.0.1:${address.port}`;
    closeServer = () =>
      new Promise((resolve) => io.close(() => httpServer.close(() => resolve())));
  });

  after(async () => {
    await closeServer();
    database.close();
  });

  it("authenticates, authorizes rooms, persists, acknowledges, and broadcasts", async () => {
    const sender = await connect(baseUrl, alex.token);
    const receiver = await connect(baseUrl, blair.token);
    await emitAck(sender, "conversation:join", conversationId);
    await emitAck(receiver, "conversation:join", conversationId);

    const received = new Promise<{ message: { content: string } }>((resolve) => {
      receiver.once("message:created", resolve);
    });
    const acknowledgement = await emitAck(sender, "message:send", {
      conversationId,
      content: "Hello in real time",
      clientId: "client-test-id",
    });
    assert.equal(acknowledgement.ok, true);
    assert.equal((await received).message.content, "Hello in real time");
    assert.equal(
      conversations.getMessages(conversationId, alex.id, 10).messages[0]?.content,
      "Hello in real time",
    );
    sender.disconnect();
    receiver.disconnect();
  });

  it("rejects unauthenticated connections", async () => {
    const socket = createClient(baseUrl, { auth: {}, reconnection: false });
    const error = await new Promise<Error>((resolve) => socket.once("connect_error", resolve));
    assert.equal(error.message, "UNAUTHORIZED");
    socket.disconnect();
  });

  it("rate-limits message creation", async () => {
    const socket = await connect(baseUrl, blair.token);
    const first = await emitAck(socket, "message:send", { conversationId, content: "Allowed" });
    const limited = await emitAck(socket, "message:send", { conversationId, content: "Too fast" });
    assert.equal(first.ok, true);
    assert.equal(limited.ok, false);
    assert.equal(limited.code, "RATE_LIMITED");
    socket.disconnect();
  });

  it("rejects events from a socket after its credential is invalidated", async () => {
    const socket = await connect(baseUrl, alex.token);
    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${alex.token}`);
    assert.equal(logout.status, 204);

    const acknowledgement = await emitAck(socket, "message:send", {
      conversationId,
      content: "This must not be persisted",
    });
    assert.equal(acknowledgement.ok, false);
    assert.equal(acknowledgement.code, "UNAUTHORIZED");
    assert.equal(
      conversations
        .getMessages(conversationId, blair.id, 20)
        .messages.some((message) => message.content === "This must not be persisted"),
      false,
    );
    socket.disconnect();
  });
});

async function signup(app: ReturnType<typeof createApp>, username: string) {
  const response = await request(app).post("/api/auth/signup").send({
    username,
    password: "socket-test-password",
  });
  return { id: response.body.user.id as string, token: response.body.token as string };
}

function connect(url: string, token: string): Promise<ClientSocket> {
  const socket = createClient(url, { auth: { token }, reconnection: false });
  return new Promise((resolve, reject) => {
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
}

function emitAck(socket: ClientSocket, event: string, payload: unknown): Promise<Record<string, unknown>> {
  return new Promise((resolve) => socket.emit(event, payload, resolve));
}
