import { sql } from "kysely";
import type { Db } from "../database/database";
import type { SeedNiche } from "./sample-catalog";

/**
 * Creates or updates niches and gadgets by their slug. Running it repeatedly is harmless.
 * Everything is published; the order in the array determines the display order.
 */
export async function seedCatalog(db: Db, catalog: SeedNiche[]): Promise<void> {
  await db.transaction().execute(async (tx) => {
    for (const [nicheIndex, niche] of catalog.entries()) {
      const { id: nicheId } = await tx
        .insertInto("niches")
        .values({
          slug: niche.slug,
          name: niche.name,
          tagline: niche.tagline,
          description: niche.description,
          emoji: niche.emoji,
          accent_color: niche.accentColor,
          // Steps of 10, so entries added by hand can be slotted in between.
          sort_order: nicheIndex * 10,
          is_published: true,
        })
        .onConflict((oc) =>
          oc.column("slug").doUpdateSet((eb) => ({
            name: eb.ref("excluded.name"),
            tagline: eb.ref("excluded.tagline"),
            description: eb.ref("excluded.description"),
            emoji: eb.ref("excluded.emoji"),
            accent_color: eb.ref("excluded.accent_color"),
            sort_order: eb.ref("excluded.sort_order"),
            is_published: eb.ref("excluded.is_published"),
            updated_at: sql`now()`,
          })),
        )
        .returning("id")
        .executeTakeFirstOrThrow();

      for (const [gadgetIndex, gadget] of niche.gadgets.entries()) {
        await tx
          .insertInto("gadgets")
          .values({
            niche_id: nicheId,
            slug: gadget.slug,
            name: gadget.name,
            tagline: gadget.tagline,
            description: gadget.description,
            // postgres.js serializes arrays for jsonb parameters as JSON.
            highlights: gadget.highlights,
            image_url: gadget.imageUrl,
            merchant_name: gadget.merchantName,
            affiliate_url: gadget.affiliateUrl,
            sort_order: gadgetIndex * 10,
            is_published: true,
          })
          .onConflict((oc) =>
            oc.columns(["niche_id", "slug"]).doUpdateSet((eb) => ({
              name: eb.ref("excluded.name"),
              tagline: eb.ref("excluded.tagline"),
              description: eb.ref("excluded.description"),
              highlights: eb.ref("excluded.highlights"),
              image_url: eb.ref("excluded.image_url"),
              merchant_name: eb.ref("excluded.merchant_name"),
              affiliate_url: eb.ref("excluded.affiliate_url"),
              sort_order: eb.ref("excluded.sort_order"),
              is_published: eb.ref("excluded.is_published"),
              updated_at: sql`now()`,
            })),
          )
          .execute();
      }
    }
  });
}
