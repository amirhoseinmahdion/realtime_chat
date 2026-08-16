import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import type { ChatDatabase } from "./database/database.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { createRateLimit } from "./middleware/rate-limit.middleware.js";
import { requestLogger, securityHeaders } from "./middleware/security.middleware.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { UserRepository } from "./modules/auth/user.repository.js";
import { ConversationRepository } from "./modules/conversations/conversation.repository.js";
import { createConversationRouter } from "./modules/conversations/conversation.routes.js";
import { createUserRouter } from "./modules/users/user.routes.js";

interface AppOptions {
  clientUrl: string;
  database: ChatDatabase;
  jwtSecret: string;
  authService?: AuthService;
  conversationRepository?: ConversationRepository;
  rateLimits?: { auth: number; search: number; windowMs: number };
}

export function createApp(options: AppOptions) {
  const app = express();
  const authService =
    options.authService ?? new AuthService(new UserRepository(options.database), options.jwtSecret);
  const conversationRepository =
    options.conversationRepository ?? new ConversationRepository(options.database);
  const limits = options.rateLimits ?? { auth: 20, search: 60, windowMs: 60_000 };

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(requestLogger);
  app.use(cors({ origin: options.clientUrl, credentials: true }));
  app.use(express.json({ limit: "320kb" }));

  app.get("/api/docs.json", (_request, response) => {
    response.status(200).json(openApiDocument);
  });
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, { customSiteTitle: "EchoLine API" }),
  );

  app.get("/api/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });
  app.use("/api/auth", createRateLimit({ limit: limits.auth, windowMs: limits.windowMs }), createAuthRouter(authService));
  app.use("/api/users/search", createRateLimit({ limit: limits.search, windowMs: limits.windowMs }));
  app.use("/api/users", createUserRouter(options.database, authService));
  app.use(
    "/api/conversations",
    createConversationRouter(conversationRepository, authService),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
