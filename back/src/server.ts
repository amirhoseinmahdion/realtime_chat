import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { createDatabase } from "./database/database.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { UserRepository } from "./modules/auth/user.repository.js";
import { ConversationRepository } from "./modules/conversations/conversation.repository.js";
import { createSocketServer } from "./socket/socket.js";

const database = createDatabase(env.databasePath);
const authService = new AuthService(new UserRepository(database), env.jwtSecret);
const conversations = new ConversationRepository(database);
const app = createApp({
  clientUrl: env.clientUrl,
  database,
  jwtSecret: env.jwtSecret,
  authService,
  conversationRepository: conversations,
});

const httpServer = createServer(app);

export const io = createSocketServer(httpServer, {
  clientUrl: env.clientUrl,
  authService,
  conversations,
});

httpServer.listen(env.port, () => {
  console.log(`Chat server listening on http://localhost:${env.port}`);
});

function shutdown(): void {
  io.close();
  httpServer.close(() => {
    database.close();
    process.exit(0);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
