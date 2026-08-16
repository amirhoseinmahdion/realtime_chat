import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../../errors/http-error.js";
import type { StoredUser } from "./auth.types.js";
import type { AuthService } from "./auth.service.js";

export interface AuthenticatedRequest extends Request {
  authUser: StoredUser;
}

export function createAuthMiddleware(authService: AuthService) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const authorization = request.header("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      next(new HttpError(401, "UNAUTHORIZED", "A Bearer token is required"));
      return;
    }

    try {
      (request as AuthenticatedRequest).authUser = authService.authenticate(authorization.slice(7));
      next();
    } catch (error) {
      next(error);
    }
  };
}
