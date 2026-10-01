import { z } from "zod";

/** URL-friendly name as it appears in page URLs, e.g. `cats` or `water-fountain-with-filter`. */
export const SlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

/** http(s) only: these values end up in `href`, where e.g. `javascript:` would be dangerous. */
export const HttpUrlSchema = z.url({ protocol: /^https?$/ });

/** An absolute http(s) URL or a path on this site like `/images/gadgets/foo.jpg`. */
export const ImageUrlSchema = z.union([HttpUrlSchema, z.string().regex(/^\/(?!\/)\S*$/)]);

/** Hex color like `#b8a1ff`. */
export const AccentColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

/** A niche (e.g. cats) in the overview on the home page. */
export const NicheSummarySchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  tagline: z.string(),
  emoji: z.string(),
  accentColor: AccentColorSchema,
  gadgetCount: z.number().int().nonnegative(),
});
export type NicheSummary = z.infer<typeof NicheSummarySchema>;

/** `GET /api/v1/niches`: published niches in display order. */
export const NichesResponseSchema = z.object({
  niches: z.array(NicheSummarySchema),
});
export type NichesResponse = z.infer<typeof NichesResponseSchema>;

export const NicheSchema = NicheSummarySchema.omit({ gadgetCount: true }).extend({
  description: z.string(),
});
export type Niche = z.infer<typeof NicheSchema>;

/** A gadget as an entry in the list of a niche. */
export const GadgetSummarySchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  tagline: z.string(),
  imageUrl: ImageUrlSchema.nullable(),
});
export type GadgetSummary = z.infer<typeof GadgetSummarySchema>;

/** `GET /api/v1/niches/:nicheSlug`: the niche with its published gadgets in display order. */
export const NicheDetailResponseSchema = z.object({
  niche: NicheSchema,
  gadgets: z.array(GadgetSummarySchema),
});
export type NicheDetailResponse = z.infer<typeof NicheDetailResponseSchema>;

export const GadgetSchema = GadgetSummarySchema.extend({
  /** Running text; paragraphs are separated by a blank line. */
  description: z.string(),
  /** Short bullet points on why the gadget is clever. */
  highlights: z.array(z.string()),
  /** Name of the merchant, e.g. for the button "Get it at …". */
  merchantName: z.string(),
  /** The affiliate link to the merchant's page. */
  affiliateUrl: HttpUrlSchema,
  niche: NicheSchema.pick({ slug: true, name: true, emoji: true, accentColor: true }),
});
export type Gadget = z.infer<typeof GadgetSchema>;

/** `GET /api/v1/niches/:nicheSlug/gadgets/:gadgetSlug` */
export const GadgetResponseSchema = z.object({
  gadget: GadgetSchema,
});
export type GadgetResponse = z.infer<typeof GadgetResponseSchema>;
