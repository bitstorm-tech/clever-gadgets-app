import { z } from "zod";

/** URL-tauglicher Name, wie er in Seitenadressen vorkommt, z. B. `katzen` oder `trinkbrunnen-mit-filter`. */
export const SlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

/** Nur http(s): Diese Werte landen in `href`, wo z. B. `javascript:` gefährlich wäre. */
export const HttpUrlSchema = z.url({ protocol: /^https?$/ });

/** Eine absolute http(s)-URL oder ein Pfad auf dieser Seite wie `/images/gadgets/foo.jpg`. */
export const ImageUrlSchema = z.union([HttpUrlSchema, z.string().regex(/^\/(?!\/)\S*$/)]);

/** Hex-Farbe wie `#b8a1ff`. */
export const AccentColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

/** Eine Nische (z. B. Katzen) in der Übersicht auf der Startseite. */
export const NicheSummarySchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  tagline: z.string(),
  emoji: z.string(),
  accentColor: AccentColorSchema,
  gadgetCount: z.number().int().nonnegative(),
});
export type NicheSummary = z.infer<typeof NicheSummarySchema>;

/** `GET /api/v1/niches`: veröffentlichte Nischen in Anzeigereihenfolge. */
export const NichesResponseSchema = z.object({
  niches: z.array(NicheSummarySchema),
});
export type NichesResponse = z.infer<typeof NichesResponseSchema>;

export const NicheSchema = NicheSummarySchema.omit({ gadgetCount: true }).extend({
  description: z.string(),
});
export type Niche = z.infer<typeof NicheSchema>;

/** Ein Gadget als Eintrag in der Liste einer Nische. */
export const GadgetSummarySchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  tagline: z.string(),
  imageUrl: ImageUrlSchema.nullable(),
});
export type GadgetSummary = z.infer<typeof GadgetSummarySchema>;

/** `GET /api/v1/niches/:nicheSlug`: die Nische mit ihren veröffentlichten Gadgets in Anzeigereihenfolge. */
export const NicheDetailResponseSchema = z.object({
  niche: NicheSchema,
  gadgets: z.array(GadgetSummarySchema),
});
export type NicheDetailResponse = z.infer<typeof NicheDetailResponseSchema>;

export const GadgetSchema = GadgetSummarySchema.extend({
  /** Fließtext; Absätze sind durch eine Leerzeile getrennt. */
  description: z.string(),
  /** Kurze Stichpunkte, warum das Gadget clever ist. */
  highlights: z.array(z.string()),
  /** Name des Anbieters, z. B. für den Button "Zum Angebot bei …". */
  merchantName: z.string(),
  /** Der Affiliate-Link zur Seite des Anbieters. */
  affiliateUrl: HttpUrlSchema,
  niche: NicheSchema.pick({ slug: true, name: true, emoji: true, accentColor: true }),
});
export type Gadget = z.infer<typeof GadgetSchema>;

/** `GET /api/v1/niches/:nicheSlug/gadgets/:gadgetSlug` */
export const GadgetResponseSchema = z.object({
  gadget: GadgetSchema,
});
export type GadgetResponse = z.infer<typeof GadgetResponseSchema>;
