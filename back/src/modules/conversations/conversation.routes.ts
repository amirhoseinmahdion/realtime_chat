import { Router } from "express";

import { HttpError } from "../../errors/http-error.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { createAuthMiddleware } from "../auth/auth.middleware.js";
import type { AuthService } from "../auth/auth.service.js";
import type { ConversationRepository } from "./conversation.repository.js";

export function createConversationRouter(repository: ConversationRepository, authService: AuthService): Router {
  const router = Router();
  router.use(createAuthMiddleware(authService));

  router.get("/", (request, response) => {
    const user = (request as unknown as AuthenticatedRequest).authUser;
    response.status(200).json({ conversations: repository.listForMember(user.id) });
  });

  router.post("/", (request, response) => {
    const body = request.body as Record<string, unknown>;
    if (typeof body.userId !== "string" || !body.userId.trim()) {
      throw new HttpError(400, "VALIDATION_ERROR", "userId is required");
    }
    const user = (request as AuthenticatedRequest).authUser;
    const result = repository.createOrFindDirect(user.id, body.userId.trim());
    response.status(result.created ? 201 : 200).json(result);
  });

  router.get("/:conversationId/messages", (request, response) => {
    const user = (request as unknown as AuthenticatedRequest).authUser;
    const requestedLimit = Number(request.query.limit ?? 30);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 100) {
      throw new HttpError(400, "VALIDATION_ERROR", "Limit must be an integer between 1 and 100");
    }
    const cursor = typeof request.query.cursor === "string" ? request.query.cursor : undefined;
    response.status(200).json(
      repository.getMessages(request.params.conversationId, user.id, requestedLimit, cursor),
    );
  });

  return router;
}
