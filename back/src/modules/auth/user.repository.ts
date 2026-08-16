import type { ChatDatabase } from "../../database/database.js";
import type { PublicUser, StoredUser } from "./auth.types.js";

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  bio: string;
  avatar_url: string | null;
  token_version: number;
  created_at: string;
  updated_at: string;
}

function mapStoredUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    tokenVersion: row.token_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserRepository {
  constructor(private readonly database: ChatDatabase) {}

  findByUsername(username: string): StoredUser | undefined {
    const row = this.database
      .prepare("SELECT * FROM users WHERE lower(username) = lower(?)")
      .get(username) as UserRow | undefined;
    return row ? mapStoredUser(row) : undefined;
  }

  findById(id: string): StoredUser | undefined {
    const row = this.database.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | UserRow
      | undefined;
    return row ? mapStoredUser(row) : undefined;
  }

  create(input: {
    id: string;
    username: string;
    displayName: string;
    passwordHash: string;
    timestamp: string;
  }): StoredUser {
    this.database
      .prepare(
        `INSERT INTO users
          (id, username, display_name, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.id,
        input.username,
        input.displayName,
        input.passwordHash,
        input.timestamp,
        input.timestamp,
      );

    const user = this.findById(input.id);
    if (!user) throw new Error("Created user could not be loaded");
    return user;
  }

  incrementTokenVersion(id: string, currentVersion: number): boolean {
    const result = this.database
      .prepare(
        `UPDATE users
         SET token_version = token_version + 1, updated_at = ?
         WHERE id = ? AND token_version = ?`,
      )
      .run(new Date().toISOString(), id, currentVersion);
    return result.changes === 1;
  }
}
