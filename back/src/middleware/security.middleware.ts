import { randomUUID } from "node:crypto";

import type { RequestHandler } from "express";

export const securityHeaders: RequestHandler = (_request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
};

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now();
  const requestId = request.header("x-request-id")?.slice(0, 100) || randomUUID();
  response.setHeader("X-Request-Id", requestId);
  response.on("finish", () => {
    console.info(JSON.stringify({
      level: "info",
      event: "http_request",
      requestId,
      method: request.method,
      path: request.originalUrl.split("?")[0],
      status: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    }));
  });
  next();
};
