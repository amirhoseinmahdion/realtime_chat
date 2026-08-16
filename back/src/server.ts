import { createServer } from "node:http";

import { Server } from "socket.io";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { createDatabase } from "./database/database.js";

const database = createDatabase(env.databasePath);
const app = createApp({
  clientUrl: env.clientUrl,
  database,
  jwtSecret: env.jwtSecret,
});

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.emit("server:ready", { connected: true });
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
