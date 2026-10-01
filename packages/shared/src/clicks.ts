import { z } from "zod";

/** Longest stored UTM value. Longer values are not a sensible campaign name. */
export const MAX_UTM_LENGTH = 100;

const UtmValueSchema = z.string().trim().min(1).max(MAX_UTM_LENGTH).optional();

/**
 * `POST /api/v1/niches/:nicheSlug/gadgets/:gadgetSlug/clicks`: reports a click on the affiliate link.
 * No personal data is sent on purpose, only the origin from the UTM parameters.
 */
export const RecordClickRequestSchema = z.object({
  utmSource: UtmValueSchema,
  utmMedium: UtmValueSchema,
  utmCampaign: UtmValueSchema,
});
export type RecordClickRequest = z.infer<typeof RecordClickRequestSchema>;
