import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { HttpError } from "../../errors/http-error.js";
import type { AuthTokenPayload, PublicUser, StoredUser } from "./auth.types.js";
import { toPublicUser, UserRepository } from "./user.repository.js";

const usernamePattern = /^[a-z0-9_]{3,30}$/;

export function normalizeUsername(value: unknown): string {
  if (typeof value !== "string") {
    throw new HttpError(400, "VALIDATION_ERROR", "Username is required");
  }

  const username = value.trim().toLowerCase();
  if (!usernamePattern.test(username)) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "Username must be 3-30 characters using letters, numbers, or underscores",
    );
  }
  return username;
}

function validatePassword(value: unknown): string {
  if (typeof value !== "string" || value.length < 8 || value.length > 72) {
    throw new HttpError(400, "VALIDATION_ERROR", "Password must be 8-72 characters");
  }
  return value;
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtSecret: string,
  ) {}

  async signup(body: Record<string, unknown>): Promise<{ user: PublicUser; token: string }> {
    const username = normalizeUsername(body.username);
    const password = validatePassword(body.password);
    const rawDisplayName = body.displayName;
    const displayName =
      typeof rawDisplayName === "string" && rawDisplayName.trim()
        ? rawDisplayName.trim().slice(0, 50)
        : username;

    if (this.users.findByUsername(username)) {
      throw new HttpError(409, "USERNAME_TAKEN", "Username is already in use");
    }

    const timestamp = new Date().toISOString();
    const user = this.users.create({
      id: randomUUID(),
      username,
      displayName,
      passwordHash: await bcrypt.hash(password, 12),
      timestamp,
    });

    return { user: toPublicUser(user), token: this.signToken(user) };
  }

  async login(body: Record<string, unknown>): Promise<{ user: PublicUser; token: string }> {
    const username = normalizeUsername(body.username);
    const password = validatePassword(body.password);
    const user = this.users.findByUsername(username);

    if (!user || user.deletedAt || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid username or password");
    }

    return { user: toPublicUser(user), token: this.signToken(user) };
  }

  authenticate(token: string): StoredUser {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as AuthTokenPayload;
      const user = this.users.findById(payload.sub);
      if (!user || user.deletedAt || user.tokenVersion !== payload.tokenVersion) {
        throw new Error("Token has been invalidated");
      }
      return user;
    } catch {
      throw new HttpError(401, "UNAUTHORIZED", "A valid authentication token is required");
    }
  }

  logout(user: StoredUser): void {
    if (!this.users.incrementTokenVersion(user.id, user.tokenVersion)) {
      throw new HttpError(401, "UNAUTHORIZED", "Authentication token is no longer valid");
    }
  }

  createSession(user: StoredUser): { user: PublicUser; token: string } {
    return { user: toPublicUser(user), token: this.signToken(user) };
  }

  private signToken(user: StoredUser): string {
    const payload: AuthTokenPayload = { sub: user.id, tokenVersion: user.tokenVersion };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "15m" });
  }
}
