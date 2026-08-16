import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import type { Express } from "express";
import request from "supertest";

import { createApp } from "../src/app.js";
import { createDatabase, type ChatDatabase } from "../src/database/database.js";

describe("authentication API", () => {
  let app: Express;
  let database: ChatDatabase;

  before(() => {
    database = createDatabase(":memory:");
    app = createApp({
      clientUrl: "http://localhost:3000",
      database,
      jwtSecret: "integration-test-secret",
    });
  });

  after(() => {
    database.close();
  });

  it("signs up, authenticates, logs out, and invalidates the token", async () => {
    const signup = await request(app).post("/api/auth/signup").send({
      username: "  Test_User  ",
      password: "correct-horse-battery-staple",
      displayName: "Test User",
    });

    assert.equal(signup.status, 201);
    assert.equal(signup.body.user.username, "test_user");
    assert.equal(signup.body.user.passwordHash, undefined);
    assert.equal(typeof signup.body.token, "string");

    const token = signup.body.token as string;
    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.user.username, "test_user");

    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(logout.status, 204);

    const invalidated = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(invalidated.status, 401);
  });

  it("rejects normalized duplicate usernames", async () => {
    const duplicate = await request(app).post("/api/auth/signup").send({
      username: "TEST_USER",
      password: "another-secure-password",
    });
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.body.error.code, "USERNAME_TAKEN");
  });

  it("logs in with valid credentials and rejects invalid credentials", async () => {
    const login = await request(app).post("/api/auth/login").send({
      username: "test_user",
      password: "correct-horse-battery-staple",
    });
    assert.equal(login.status, 200);
    assert.equal(typeof login.body.token, "string");

    const invalid = await request(app).post("/api/auth/login").send({
      username: "test_user",
      password: "incorrect-password",
    });
    assert.equal(invalid.status, 401);
    assert.equal(invalid.body.error.code, "INVALID_CREDENTIALS");
  });

  it("rejects missing and malformed bearer tokens", async () => {
    assert.equal((await request(app).get("/api/auth/me")).status, 401);
    assert.equal(
      (
        await request(app)
          .get("/api/auth/me")
          .set("Authorization", "Bearer malformed-token")
      ).status,
      401,
    );
  });

  it("reads and updates a profile while rotating credentials", async () => {
    const signup = await request(app).post("/api/auth/signup").send({
      username: "profile_user",
      password: "profile-password",
      displayName: "Before",
    });
    const token = signup.body.token as string;

    const profile = await request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`);
    assert.equal(profile.status, 200);
    assert.equal(profile.body.user.displayName, "Before");

    const updated = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "profile_updated",
        displayName: "After",
        bio: "Available for a chat.",
        avatarUrl: "data:image/png;base64,iVBORw0KGgo=",
      });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.user.username, "profile_updated");
    assert.equal(updated.body.user.bio, "Available for a chat.");
    assert.equal(updated.body.user.avatarUrl, "data:image/png;base64,iVBORw0KGgo=");
    assert.equal(typeof updated.body.token, "string");
    assert.equal((await request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`)).status, 401);
    assert.equal(
      (await request(app).get("/api/users/me").set("Authorization", `Bearer ${updated.body.token as string}`)).status,
      200,
    );
  });

  it("validates profile fields and normalized username conflicts", async () => {
    const first = await request(app).post("/api/auth/signup").send({
      username: "conflict_one",
      password: "profile-password",
    });
    await request(app).post("/api/auth/signup").send({
      username: "conflict_two",
      password: "profile-password",
    });

    const conflict = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${first.body.token as string}`)
      .send({ username: "CONFLICT_TWO", displayName: "Valid", bio: "", avatarUrl: null });
    assert.equal(conflict.status, 409);

    const invalid = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${first.body.token as string}`)
      .send({ username: "conflict_one", displayName: "", bio: "", avatarUrl: "javascript:alert(1)" });
    assert.equal(invalid.status, 400);

    const oversizedAvatar = `data:image/png;base64,${Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      Buffer.alloc(500 * 1024),
    ]).toString("base64")}`;
    const oversized = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${first.body.token as string}`)
      .send({
        username: "conflict_one",
        displayName: "Valid",
        bio: "",
        avatarUrl: oversizedAvatar,
      });
    assert.equal(oversized.status, 400);
    assert.match(oversized.body.error.message, /500 KB/);
  });

  it("requires confirmation, anonymizes history, and prevents login after deletion", async () => {
    const owner = await request(app).post("/api/auth/signup").send({
      username: "delete_me",
      password: "delete-password",
      displayName: "Delete Me",
    });
    const peer = await request(app).post("/api/auth/signup").send({
      username: "history_peer",
      password: "history-password",
    });
    const conversation = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${owner.body.token as string}`)
      .send({ userId: peer.body.user.id });
    database.prepare(
      `INSERT INTO messages (id, conversation_id, sender_id, content, created_at, updated_at)
       VALUES ('retained-message', ?, ?, 'history remains', ?, ?)`,
    ).run(conversation.body.conversation.id, owner.body.user.id, new Date().toISOString(), new Date().toISOString());

    const unconfirmed = await request(app)
      .delete("/api/users/me")
      .set("Authorization", `Bearer ${owner.body.token as string}`)
      .send({ confirmation: "delete" });
    assert.equal(unconfirmed.status, 400);

    const deleted = await request(app)
      .delete("/api/users/me")
      .set("Authorization", `Bearer ${owner.body.token as string}`)
      .send({ confirmation: "DELETE" });
    assert.equal(deleted.status, 204);
    assert.equal((await request(app).get("/api/auth/me").set("Authorization", `Bearer ${owner.body.token as string}`)).status, 401);
    assert.equal(
      (await request(app).post("/api/auth/login").send({ username: "delete_me", password: "delete-password" })).status,
      401,
    );

    const history = await request(app)
      .get(`/api/conversations/${conversation.body.conversation.id as string}/messages`)
      .set("Authorization", `Bearer ${peer.body.token as string}`);
    assert.equal(history.status, 200);
    assert.equal(history.body.messages[0].content, "history remains");
    assert.match(history.body.messages[0].sender.username, /^deleted_/);
  });
});
