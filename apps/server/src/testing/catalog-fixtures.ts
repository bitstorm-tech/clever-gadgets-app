import type { Insertable } from "kysely";
import type { Db, GadgetsTable, NichesTable } from "../database/database";

/** Legt eine veröffentlichte Nische an; `overrides` ändern einzelne Felder. */
export async function insertNiche(db: Db, overrides: Partial<Insertable<NichesTable>> = {}) {
  return db
    .insertInto("niches")
    .values({
      slug: "katzen",
      name: "Katzen",
      tagline: "Gadgets für Samtpfoten",
      description: "Alles für Katzen.",
      emoji: "🐱",
      accent_color: "#b8a1ff",
      is_published: true,
      ...overrides,
    })
    .returning(["id", "slug"])
    .executeTakeFirstOrThrow();
}

/** Legt ein veröffentlichtes Gadget in einer Nische an; `overrides` ändern einzelne Felder. */
export async function insertGadget(db: Db, nicheId: string, overrides: Partial<Insertable<GadgetsTable>> = {}) {
  return db
    .insertInto("gadgets")
    .values({
      niche_id: nicheId,
      slug: "trinkbrunnen",
      name: "Trinkbrunnen",
      tagline: "Fließendes Wasser.",
      description: "Erster Absatz.\n\nZweiter Absatz.",
      highlights: ["Leise", "Spülmaschinenfest"],
      merchant_name: "Beispiel-Shop",
      affiliate_url: "https://example.com/trinkbrunnen?tag=clever",
      is_published: true,
      ...overrides,
    })
    .returning(["id", "slug"])
    .executeTakeFirstOrThrow();
}
