import { Router } from "express";

import type { ChatDatabase } from "../../database/database.js";
import { HttpError } from "../../errors/http-error.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { createAuthMiddleware } from "../auth/auth.middleware.js";
import type { AuthService } from "../auth/auth.service.js";

interface SearchUserRow {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
}

export function createUserRouter(database: ChatDatabase, authService: AuthService): Router {
  const router = Router();
  router.use(createAuthMiddleware(authService));

  router.get("/search", (request, response) => {
    const query = typeof request.query.q === "string" ? request.query.q.trim() : "";
    if (query.length < 1 || query.length > 50) {
      throw new HttpError(400, "VALIDATION_ERROR", "Search query must be 1-50 characters");
    }

    const requestedLimit = Number(request.query.limit ?? 20);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 50) {
      throw new HttpError(400, "VALIDATION_ERROR", "Limit must be an integer between 1 and 50");
    }

    const currentUser = (request as AuthenticatedRequest).authUser;
    const pattern = `%${query.toLowerCase().replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    const rows = database
      .prepare(
        `SELECT id, username, display_name, bio, avatar_url
         FROM users
         WHERE id != ?
           AND (lower(username) LIKE ? ESCAPE '\\' OR lower(display_name) LIKE ? ESCAPE '\\')
         ORDER BY CASE WHEN lower(username) = lower(?) THEN 0 ELSE 1 END, lower(username)
         LIMIT ?`,
      )
      .all(currentUser.id, pattern, pattern, query, requestedLimit) as SearchUserRow[];

    response.status(200).json({
      users: rows.map((row) => ({
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        bio: row.bio,
        avatarUrl: row.avatar_url,
      })),
    });
  });

  return router;
}
