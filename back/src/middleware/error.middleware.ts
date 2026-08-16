import type { ErrorRequestHandler, RequestHandler } from "express";

import { HttpError } from "../errors/http-error.js";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ error: { code: "INVALID_JSON", message: "Request body must contain valid JSON" } });
    return;
  }

  if (typeof error === "object" && error && "type" in error && error.type === "entity.too.large") {
    response.status(413).json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Request body is too large" } });
    return;
  }

  console.error(JSON.stringify({ level: "error", event: "unhandled_error", requestId: response.getHeader("X-Request-Id") }));
  response.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" },
  });
};
