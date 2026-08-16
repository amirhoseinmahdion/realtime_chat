import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import type { Express } from "express";
import request from "supertest";

import { createApp } from "../src/app.js";
import { createDatabase, type ChatDatabase } from "../src/database/database.js";

interface TestAccount {
  id: string;
  token: string;
}

describe("user and conversation APIs", () => {
  let app: Express;
  let database: ChatDatabase;
  let alex: TestAccount;
  let blair: TestAccount;
  let casey: TestAccount;

  before(async () => {
    database = createDatabase(":memory:");
    app = createApp({
      clientUrl: "http://localhost:3000",
      database,
      jwtSecret: "conversation-test-secret",
    });
    alex = await signup(app, "alex_chat", "Alex Rivers");
    blair = await signup(app, "blair_chat", "Blair Stone");
    casey = await signup(app, "casey_chat", "Casey Blair");
  });

  after(() => database.close());

  it("searches username and display name while excluding the requester", async () => {
    const response = await request(app)
      .get("/api/users/search?q=blair")
      .set("Authorization", `Bearer ${alex.token}`);

    assert.equal(response.status, 200);
    assert.deepEqual(
      response.body.users.map((user: { username: string }) => user.username),
      ["blair_chat", "casey_chat"],
    );
    assert.equal(response.body.users.some((user: { id: string }) => user.id === alex.id), false);
  });

  it("creates a direct conversation once and returns it to both members", async () => {
    const first = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${alex.token}`)
      .send({ userId: blair.id });
    assert.equal(first.status, 201);
    assert.equal(first.body.created, true);
    assert.equal(first.body.conversation.participant.username, "blair_chat");

    const duplicate = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${blair.token}`)
      .send({ userId: alex.id });
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.created, false);
    assert.equal(duplicate.body.conversation.id, first.body.conversation.id);

    const list = await request(app)
      .get("/api/conversations")
      .set("Authorization", `Bearer ${alex.token}`);
    assert.equal(list.status, 200);
    assert.equal(list.body.conversations.length, 1);
  });

  it("paginates message history and hides conversations from non-members", async () => {
    const conversation = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${alex.token}`)
      .send({ userId: blair.id });
    const conversationId = conversation.body.conversation.id as string;
    const insert = database.prepare(
      `INSERT INTO messages
       (id, conversation_id, sender_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (let index = 1; index <= 3; index += 1) {
      const timestamp = `2026-08-16T10:00:0${index}.000Z`;
      insert.run(`message-${index}`, conversationId, alex.id, `Message ${index}`, timestamp, timestamp);
    }

    const firstPage = await request(app)
      .get(`/api/conversations/${conversationId}/messages?limit=2`)
      .set("Authorization", `Bearer ${alex.token}`);
    assert.equal(firstPage.status, 200);
    assert.deepEqual(
      firstPage.body.messages.map((message: { id: string }) => message.id),
      ["message-2", "message-3"],
    );
    assert.equal(firstPage.body.nextCursor, "message-2");

    const secondPage = await request(app)
      .get(`/api/conversations/${conversationId}/messages?limit=2&cursor=message-2`)
      .set("Authorization", `Bearer ${alex.token}`);
    assert.deepEqual(
      secondPage.body.messages.map((message: { id: string }) => message.id),
      ["message-1"],
    );
    assert.equal(secondPage.body.nextCursor, null);

    const hidden = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${casey.token}`);
    assert.equal(hidden.status, 404);
  });

  it("validates searches, limits, and direct-chat targets", async () => {
    const auth = { Authorization: `Bearer ${alex.token}` };
    assert.equal((await request(app).get("/api/users/search?q=").set(auth)).status, 400);
    assert.equal((await request(app).get("/api/users/search?q=a&limit=200").set(auth)).status, 400);
    assert.equal(
      (await request(app).post("/api/conversations").set(auth).send({ userId: alex.id })).status,
      400,
    );
    assert.equal(
      (await request(app).post("/api/conversations").set(auth).send({ userId: "missing" })).status,
      404,
    );
  });
});

async function signup(app: Express, username: string, displayName: string): Promise<TestAccount> {
  const response = await request(app).post("/api/auth/signup").send({
    username,
    displayName,
    password: "integration-password",
  });
  assert.equal(response.status, 201);
  return { id: response.body.user.id as string, token: response.body.token as string };
}
