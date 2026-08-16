import { HttpError } from "../../errors/http-error.js";
import type { AuthService } from "../auth/auth.service.js";
import { normalizeUsername } from "../auth/auth.service.js";
import type { PublicUser, StoredUser } from "../auth/auth.types.js";
import { toPublicUser, type UserRepository } from "../auth/user.repository.js";

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new HttpError(400, "VALIDATION_ERROR", `${field} must be 1-${maxLength} characters`);
  }
  return value.trim();
}

function biography(value: unknown): string {
  if (typeof value !== "string" || value.trim().length > 160) {
    throw new HttpError(400, "VALIDATION_ERROR", "Biography must be 0-160 characters");
  }
  return value.trim();
}

function avatarUrl(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > 500) {
    throw new HttpError(400, "VALIDATION_ERROR", "Avatar URL must be at most 500 characters");
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Invalid protocol");
    return url.toString();
  } catch {
    throw new HttpError(400, "VALIDATION_ERROR", "Avatar URL must be a valid HTTP or HTTPS URL");
  }
}

export class ProfileService {
  constructor(
    private readonly users: UserRepository,
    private readonly auth: AuthService,
  ) {}

  get(user: StoredUser): PublicUser {
    return toPublicUser(user);
  }

  update(user: StoredUser, body: Record<string, unknown>) {
    const username = normalizeUsername(body.username);
    const existing = this.users.findByUsername(username);
    if (existing && existing.id !== user.id) {
      throw new HttpError(409, "USERNAME_TAKEN", "Username is already in use");
    }
    const updated = this.users.updateProfile(user, {
      username,
      displayName: requiredText(body.displayName, "Display name", 50),
      bio: biography(body.bio),
      avatarUrl: avatarUrl(body.avatarUrl),
    });
    return this.auth.createSession(updated);
  }

  delete(user: StoredUser, body: Record<string, unknown>): void {
    if (body.confirmation !== "DELETE") {
      throw new HttpError(400, "CONFIRMATION_REQUIRED", 'Type "DELETE" to confirm account deletion');
    }
    this.users.anonymize(user);
  }
}
