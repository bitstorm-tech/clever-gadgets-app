import { sql } from "kysely";
import type { Db } from "../database/database";
import type { SeedNiche } from "./sample-catalog";

/**
 * Legt Nischen und Gadgets an oder aktualisiert sie anhand ihres Slugs. Mehrfaches Ausführen ist unbedenklich.
 * Alles wird veröffentlicht; die Reihenfolge im Array bestimmt die Anzeigereihenfolge.
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
          // Abstände von 10, damit sich von Hand eingetragene Einträge dazwischen einordnen lassen.
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
            // postgres.js serialisiert Arrays für jsonb-Parameter als JSON.
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
