import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import type { Express } from "express";
import request from "supertest";

import { createApp } from "../src/app.js";
import { loadEnvironment } from "../src/config/env.js";
import { createDatabase, type ChatDatabase } from "../src/database/database.js";

describe("release readiness", () => {
  let app: Express;
  let database: ChatDatabase;
  let token: string;

  before(async () => {
    database = createDatabase(":memory:");
    app = createApp({
      clientUrl: "http://localhost:3000",
      database,
      jwtSecret: "quality-test-secret-with-32-characters",
      rateLimits: { auth: 10, search: 1, windowMs: 60_000 },
    });
    const signup = await request(app).post("/api/auth/signup").send({
      username: "quality_user",
      password: "quality-password",
    });
    token = signup.body.token as string;
  });

  after(() => database.close());

  it("validates required startup configuration", () => {
    assert.throws(() => loadEnvironment({}), /JWT_SECRET/);
    assert.throws(() => loadEnvironment({ JWT_SECRET: "short" }), /32 characters/);
    assert.throws(
      () => loadEnvironment({ JWT_SECRET: "x".repeat(32), DATABASE_PATH: "chat.db", CLIENT_URL: "ftp://invalid" }),
      /CLIENT_URL/,
    );
    assert.deepEqual(
      loadEnvironment({
        PORT: "4100",
        CLIENT_URL: "http://localhost:3000/path",
        DATABASE_PATH: "./data/test.db",
        JWT_SECRET: "x".repeat(32),
      }),
      {
        port: 4100,
        clientUrl: "http://localhost:3000",
        databasePath: "./data/test.db",
        jwtSecret: "x".repeat(32),
      },
    );
  });

  it("adds defensive headers and a request identifier", async () => {
    const response = await request(app).get("/api/health");
    assert.equal(response.status, 200);
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    assert.equal(response.headers["x-frame-options"], "DENY");
    assert.equal(typeof response.headers["x-request-id"], "string");
  });

  it("returns safe errors for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"username":');
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "INVALID_JSON");
    assert.equal(JSON.stringify(response.body).includes("SyntaxError"), false);
  });

  it("rate-limits user search with retry metadata", async () => {
    const first = await request(app)
      .get("/api/users/search?q=nobody")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(first.status, 200);
    const limited = await request(app)
      .get("/api/users/search?q=nobody")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(limited.status, 429);
    assert.equal(limited.body.error.code, "RATE_LIMITED");
    assert.equal(typeof limited.headers["retry-after"], "string");
  });

  it("rate-limits repeated authentication attempts", async () => {
    const isolatedDatabase = createDatabase(":memory:");
    const isolatedApp = createApp({
      clientUrl: "http://localhost:3000",
      database: isolatedDatabase,
      jwtSecret: "isolated-quality-secret-with-32-chars",
      rateLimits: { auth: 1, search: 10, windowMs: 60_000 },
    });
    try {
      const first = await request(isolatedApp).post("/api/auth/login").send({
        username: "missing_user",
        password: "missing-password",
      });
      const limited = await request(isolatedApp).post("/api/auth/login").send({
        username: "missing_user",
        password: "missing-password",
      });
      assert.equal(first.status, 401);
      assert.equal(limited.status, 429);
      assert.equal(limited.body.error.code, "RATE_LIMITED");
    } finally {
      isolatedDatabase.close();
    }
  });
});
