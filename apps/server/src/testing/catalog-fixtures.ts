import type { Insertable } from "kysely";
import type { Db, GadgetsTable, NichesTable } from "../database/database";

/** Creates a published niche; `overrides` change individual fields. */
export async function insertNiche(db: Db, overrides: Partial<Insertable<NichesTable>> = {}) {
  return db
    .insertInto("niches")
    .values({
      slug: "cats",
      name: "Cats",
      tagline: "Gadgets for cats",
      description: "Everything for cats.",
      emoji: "🐱",
      accent_color: "#b8a1ff",
      is_published: true,
      ...overrides,
    })
    .returning(["id", "slug"])
    .executeTakeFirstOrThrow();
}

/** Creates a published gadget in a niche; `overrides` change individual fields. */
export async function insertGadget(db: Db, nicheId: string, overrides: Partial<Insertable<GadgetsTable>> = {}) {
  return db
    .insertInto("gadgets")
    .values({
      niche_id: nicheId,
      slug: "water-fountain",
      name: "Water Fountain",
      tagline: "Flowing water.",
      description: "First paragraph.\n\nSecond paragraph.",
      highlights: ["Quiet", "Dishwasher safe"],
      merchant_name: "Example Shop",
      affiliate_url: "https://example.com/water-fountain?tag=clever",
      is_published: true,
      ...overrides,
    })
    .returning(["id", "slug"])
    .executeTakeFirstOrThrow();
}
