import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("apiRequest", () => {
  it("normalizes network failures into a recoverable API error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(apiRequest("/api/health")).rejects.toMatchObject({
      code: "API_UNAVAILABLE",
      status: 0,
    } satisfies Partial<ApiError>);
  });

  it("preserves safe server error details", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: { code: "RATE_LIMITED", message: "Try later" } }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    )));
    await expect(apiRequest("/api/users/search?q=a")).rejects.toMatchObject({
      code: "RATE_LIMITED",
      message: "Try later",
      status: 429,
    } satisfies Partial<ApiError>);
  });
});
