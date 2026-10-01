import type { ErrorCode } from "@clever-gadgets/shared";

/**
 * Ein erwarteter Fehler mit Code und Text für den Client.
 * Die HTTP-Schicht ordnet dem Code einen Status zu; `cause` wird geloggt, aber nie an den Client gesendet.
 */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AppError";
  }
}
