import "dotenv/config";

function parsePort(value: string | undefined): number {
  const port = Number(value ?? "4000");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

export const env = {
  port: parsePort(process.env.PORT),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  databasePath: process.env.DATABASE_PATH ?? "./data/chat.db",
  jwtSecret: process.env.JWT_SECRET ?? "local-development-secret-change-me",
} as const;
