import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import type { ChatDatabase } from "./database/database.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
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
}

export function createApp(options: AppOptions) {
  const app = express();
  const authService = new AuthService(new UserRepository(options.database), options.jwtSecret);

  app.disable("x-powered-by");
  app.use(cors({ origin: options.clientUrl, credentials: true }));
  app.use(express.json({ limit: "32kb" }));

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
  app.use("/api/auth", createAuthRouter(authService));
  app.use("/api/users", createUserRouter(options.database, authService));
  app.use(
    "/api/conversations",
    createConversationRouter(new ConversationRepository(options.database), authService),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
