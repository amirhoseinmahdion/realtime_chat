import "dotenv/config";

export interface AppEnvironment {
  port: number;
  clientUrl: string;
  databasePath: string;
  jwtSecret: string;
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? "4000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

function parseHttpUrl(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is required`);
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    return url.origin;
  } catch {
    throw new Error(`${name} must be a valid HTTP or HTTPS origin`);
  }
}

export function loadEnvironment(source: NodeJS.ProcessEnv): AppEnvironment {
  const jwtSecret = source.JWT_SECRET?.trim();
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET is required and must contain at least 32 characters");
  }
  const databasePath = source.DATABASE_PATH?.trim();
  if (!databasePath) throw new Error("DATABASE_PATH is required");

  return {
    port: parsePort(source.PORT),
    clientUrl: parseHttpUrl(source.CLIENT_URL, "CLIENT_URL"),
    databasePath,
    jwtSecret,
  };
}
