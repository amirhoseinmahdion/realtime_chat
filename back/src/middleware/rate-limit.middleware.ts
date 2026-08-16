import type { RequestHandler } from "express";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface Entry {
  count: number;
  resetAt: number;
}

export function createRateLimit(options: RateLimitOptions): RequestHandler {
  const clients = new Map<string, Entry>();
  return (request, response, next) => {
    const now = Date.now();
    const key = request.ip ?? request.socket.remoteAddress ?? "unknown";
    const previous = clients.get(key);
    const entry = !previous || previous.resetAt <= now
      ? { count: 0, resetAt: now + options.windowMs }
      : previous;
    entry.count += 1;
    clients.set(key, entry);

    response.setHeader("RateLimit-Limit", options.limit);
    response.setHeader("RateLimit-Remaining", Math.max(0, options.limit - entry.count));
    response.setHeader("RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
    if (entry.count > options.limit) {
      response.setHeader("Retry-After", Math.max(1, Math.ceil((entry.resetAt - now) / 1000)));
      response.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } });
      return;
    }
    next();
  };
}
