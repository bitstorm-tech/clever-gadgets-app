import { type ErrorCode, ErrorResponseSchema } from "@clever-gadgets/shared";
import type { z } from "zod";

/** A failed API call. `message` is meant for developers; the views show their own texts to visitors. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: ErrorCode | "NETWORK_ERROR",
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** The requested niche or gadget does not exist (or no longer does). */
  get isNotFound(): boolean {
    return this.code === "NOT_FOUND" || this.code === "NICHE_NOT_FOUND" || this.code === "GADGET_NOT_FOUND";
  }
}

/** Calls `GET /api/v1{path}` and validates the JSON response. Throws ApiError on every failure. */
export async function apiRequest<T extends z.ZodType>(path: string, schema: T): Promise<z.infer<T>> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`);
  } catch {
    throw new ApiError("Could not reach the server", "NETWORK_ERROR");
  }

  if (!response.ok) {
    const error = ErrorResponseSchema.safeParse(await response.json().catch(() => null));
    throw error.success
      ? new ApiError(error.data.error.message, error.data.error.code)
      : new ApiError(`Unexpected error response (HTTP ${response.status})`, "INTERNAL_ERROR");
  }

  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new ApiError("The server sent an unexpected response", "INTERNAL_ERROR");
  return parsed.data;
}
