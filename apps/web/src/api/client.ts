import { type ErrorCode, ErrorResponseSchema } from "@clever-gadgets/shared";
import type { z } from "zod";

/** Ein fehlgeschlagener API-Aufruf. `message` ist für Entwickler; Besuchern zeigen die Ansichten eigene Texte. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: ErrorCode | "NETWORK_ERROR",
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Die angefragte Nische oder das Gadget gibt es nicht (oder nicht mehr). */
  get isNotFound(): boolean {
    return this.code === "NOT_FOUND" || this.code === "NICHE_NOT_FOUND" || this.code === "GADGET_NOT_FOUND";
  }
}

/** Ruft `GET /api/v1{path}` auf und prüft die JSON-Antwort. Wirft ApiError bei jedem Fehler. */
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
