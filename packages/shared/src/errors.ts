import { z } from "zod";

/** Error codes for the client. Details about causes stay in the server logs. */
export const ErrorCode = {
  NICHE_NOT_FOUND: "NICHE_NOT_FOUND",
  GADGET_NOT_FOUND: "GADGET_NOT_FOUND",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.enum(ErrorCode),
    message: z.string(),
    requestId: z.string().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
