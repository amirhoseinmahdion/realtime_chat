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
});
