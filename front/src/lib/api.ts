import type { ApiErrorResponse } from "@/types/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("The server is unavailable. Check your connection and try again.", 0, "API_UNAVAILABLE");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      body?.error.message ?? "We could not complete your request.",
      response.status,
      body?.error.code ?? "REQUEST_FAILED",
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
