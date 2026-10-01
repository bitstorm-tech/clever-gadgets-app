import { z } from "zod";

/** Längster gespeicherter UTM-Wert. Längere Werte sind kein sinnvoller Kampagnenname. */
export const MAX_UTM_LENGTH = 100;

const UtmValueSchema = z.string().trim().min(1).max(MAX_UTM_LENGTH).optional();

/**
 * `POST /api/v1/niches/:nicheSlug/gadgets/:gadgetSlug/clicks`: meldet einen Klick auf den Affiliate-Link.
 * Es werden bewusst keine personenbezogenen Daten übertragen, nur die Herkunft aus den UTM-Parametern.
 */
export const RecordClickRequestSchema = z.object({
  utmSource: UtmValueSchema,
  utmMedium: UtmValueSchema,
  utmCampaign: UtmValueSchema,
});
export type RecordClickRequest = z.infer<typeof RecordClickRequestSchema>;
