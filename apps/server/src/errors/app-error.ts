import type { ErrorCode } from "@clever-gadgets/shared";

/**
 * An expected error with a code and a message for the client.
 * The HTTP layer maps the code to a status; `cause` is logged but never sent to the client.
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
