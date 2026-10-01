import { ErrorCode, type GadgetResponse, type NicheDetailResponse, type NichesResponse } from "@clever-gadgets/shared";
import { sql } from "kysely";
import type { Db } from "../database/database";
import { AppError } from "../errors/app-error";

/** Veröffentlichte Nischen in Anzeigereihenfolge, jeweils mit der Zahl ihrer veröffentlichten Gadgets. */
export async function listNiches(db: Db): Promise<NichesResponse> {
  const rows = await db
    .selectFrom("niches as n")
    .select((eb) => [
      "n.slug",
      "n.name",
      "n.tagline",
      "n.emoji",
      "n.accent_color as accentColor",
      eb
        .selectFrom("gadgets as g")
        .select(sql<number>`count(*)::int`.as("count"))
        .whereRef("g.niche_id", "=", "n.id")
        .where("g.is_published", "=", true)
        .as("gadgetCount"),
    ])
    .where("n.is_published", "=", true)
    .orderBy("n.sort_order")
    .orderBy("n.name")
    .execute();

  // count(*) liefert nie NULL; Kysely typisiert Unterabfragen in der Select-Liste aber vorsichtshalber als nullable.
  return { niches: rows.map((row) => ({ ...row, gadgetCount: row.gadgetCount ?? 0 })) };
}

/** Eine veröffentlichte Nische mit ihren veröffentlichten Gadgets in Anzeigereihenfolge. */
export async function getNiche(db: Db, nicheSlug: string): Promise<NicheDetailResponse> {
  const niche = await db
    .selectFrom("niches")
    .select(["id", "slug", "name", "tagline", "description", "emoji", "accent_color as accentColor"])
    .where("slug", "=", nicheSlug)
    .where("is_published", "=", true)
    .executeTakeFirst();
  if (!niche) throw new AppError(ErrorCode.NICHE_NOT_FOUND, `Niche "${nicheSlug}" not found.`);

  const gadgets = await db
    .selectFrom("gadgets")
    .select(["slug", "name", "tagline", "image_url as imageUrl"])
    .where("niche_id", "=", niche.id)
    .where("is_published", "=", true)
    .orderBy("sort_order")
    .orderBy("name")
    .execute();

  return {
    niche: {
      slug: niche.slug,
      name: niche.name,
      tagline: niche.tagline,
      description: niche.description,
      emoji: niche.emoji,
      accentColor: niche.accentColor,
    },
    gadgets,
  };
}

/** Ein veröffentlichtes Gadget einer veröffentlichten Nische, mit Affiliate-Link. */
export async function getGadget(db: Db, nicheSlug: string, gadgetSlug: string): Promise<GadgetResponse> {
  const row = await publishedGadget(db, nicheSlug, gadgetSlug)
    .select([
      "g.slug",
      "g.name",
      "g.tagline",
      "g.description",
      "g.highlights",
      "g.image_url as imageUrl",
      "g.merchant_name as merchantName",
      "g.affiliate_url as affiliateUrl",
      "n.slug as nicheSlug",
      "n.name as nicheName",
      "n.emoji as nicheEmoji",
      "n.accent_color as nicheAccentColor",
    ])
    .executeTakeFirst();
  if (!row) throw new AppError(ErrorCode.GADGET_NOT_FOUND, `Gadget "${nicheSlug}/${gadgetSlug}" not found.`);

  return {
    gadget: {
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      highlights: row.highlights,
      imageUrl: row.imageUrl,
      merchantName: row.merchantName,
      affiliateUrl: row.affiliateUrl,
      niche: { slug: row.nicheSlug, name: row.nicheName, emoji: row.nicheEmoji, accentColor: row.nicheAccentColor },
    },
  };
}

/** Die ID eines veröffentlichten Gadgets in einer veröffentlichten Nische, sonst undefined. */
export async function findPublishedGadgetId(
  db: Db,
  nicheSlug: string,
  gadgetSlug: string,
): Promise<string | undefined> {
  const row = await publishedGadget(db, nicheSlug, gadgetSlug).select("g.id").executeTakeFirst();
  return row?.id;
}

/** Gemeinsame Abfrage: Gadget und Nische müssen beide veröffentlicht sein. */
function publishedGadget(db: Db, nicheSlug: string, gadgetSlug: string) {
  return db
    .selectFrom("gadgets as g")
    .innerJoin("niches as n", "n.id", "g.niche_id")
    .where("n.slug", "=", nicheSlug)
    .where("n.is_published", "=", true)
    .where("g.slug", "=", gadgetSlug)
    .where("g.is_published", "=", true);
}
