import { Router } from "express";

import type { AuthenticatedRequest } from "./auth.middleware.js";
import { createAuthMiddleware } from "./auth.middleware.js";
import type { AuthService } from "./auth.service.js";
import { toPublicUser } from "./user.repository.js";

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();
  const requireAuth = createAuthMiddleware(authService);

  router.post("/signup", async (request, response, next) => {
    try {
      response.status(201).json(await authService.signup(request.body as Record<string, unknown>));
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (request, response, next) => {
    try {
      response.status(200).json(await authService.login(request.body as Record<string, unknown>));
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", requireAuth, (request, response) => {
    response.status(200).json({ user: toPublicUser((request as AuthenticatedRequest).authUser) });
  });

  router.post("/logout", requireAuth, (request, response) => {
    authService.logout((request as AuthenticatedRequest).authUser);
    response.status(204).send();
  });

  return router;
}
