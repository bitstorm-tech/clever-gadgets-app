import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import {
  ErrorResponseSchema,
  GadgetResponseSchema,
  NicheDetailResponseSchema,
  NichesResponseSchema,
} from "@clever-gadgets/shared";
import { sql } from "kysely";
import { createApp } from "../app";
import { migrate } from "../database/migrate";
import { insertGadget, insertNiche } from "../testing/catalog-fixtures";
import { createTestDatabase, silentLogger, type TestDatabase } from "../testing/test-database";

let database: TestDatabase;

function get(path: string) {
  return createApp({ db: database.db, logger: silentLogger }).request(`/api/v1${path}`);
}

async function expectError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe(code as never);
}

beforeAll(async () => {
  database = await createTestDatabase();
  await migrate(database.sql, silentLogger);
}, 120_000);

afterAll(async () => {
  await database?.drop();
});

beforeEach(async () => {
  await sql`truncate niches, gadgets, gadget_clicks cascade`.execute(database.db);
});

describe("GET /api/v1/niches", () => {
  test("returns an empty list when nothing is published", async () => {
    await insertNiche(database.db, { is_published: false });

    const response = await get("/niches");

    expect(response.status).toBe(200);
    expect(NichesResponseSchema.parse(await response.json())).toEqual({ niches: [] });
  });

  test("lists published niches by sort order, then name, with the number of published gadgets", async () => {
    const cats = await insertNiche(database.db, { slug: "katzen", name: "Katzen", sort_order: 10 });
    const dogs = await insertNiche(database.db, { slug: "hunde", name: "Hunde", sort_order: 10 });
    await insertNiche(database.db, { slug: "garten", name: "Garten", sort_order: 0 });
    await insertNiche(database.db, { slug: "entwurf", name: "Entwurf", is_published: false });
    await insertGadget(database.db, cats.id, { slug: "a" });
    await insertGadget(database.db, cats.id, { slug: "b" });
    await insertGadget(database.db, cats.id, { slug: "c", is_published: false });
    await insertGadget(database.db, dogs.id, { slug: "d" });

    const response = await get("/niches");

    expect(response.status).toBe(200);
    const { niches } = NichesResponseSchema.parse(await response.json());
    expect(niches.map((niche) => [niche.slug, niche.gadgetCount])).toEqual([
      ["garten", 0],
      ["hunde", 1],
      ["katzen", 2],
    ]);
    expect(niches[2]).toEqual({
      slug: "katzen",
      name: "Katzen",
      tagline: "Gadgets für Samtpfoten",
      emoji: "🐱",
      accentColor: "#b8a1ff",
      gadgetCount: 2,
    });
  });
});

describe("GET /api/v1/niches/:nicheSlug", () => {
  test("returns the niche with its published gadgets in display order", async () => {
    const niche = await insertNiche(database.db);
    await insertGadget(database.db, niche.id, { slug: "zweites", name: "Zweites", sort_order: 20 });
    await insertGadget(database.db, niche.id, { slug: "erstes", name: "Erstes", sort_order: 10, image_url: "/images/a.jpg" });
    await insertGadget(database.db, niche.id, { slug: "entwurf", name: "Entwurf", is_published: false });

    const response = await get("/niches/katzen");

    expect(response.status).toBe(200);
    const body = NicheDetailResponseSchema.parse(await response.json());
    expect(body.niche).toEqual({
      slug: "katzen",
      name: "Katzen",
      tagline: "Gadgets für Samtpfoten",
      description: "Alles für Katzen.",
      emoji: "🐱",
      accentColor: "#b8a1ff",
    });
    expect(body.gadgets.map((gadget) => gadget.slug)).toEqual(["erstes", "zweites"]);
    expect(body.gadgets[0]?.imageUrl).toBe("/images/a.jpg");
    expect(body.gadgets[1]?.imageUrl).toBeNull();
  });

  test("returns an empty gadget list for a niche without gadgets", async () => {
    await insertNiche(database.db);

    const response = await get("/niches/katzen");

    expect(response.status).toBe(200);
    expect(NicheDetailResponseSchema.parse(await response.json()).gadgets).toEqual([]);
  });

  test("returns 404 for unknown and unpublished niches", async () => {
    await insertNiche(database.db, { slug: "entwurf", is_published: false });

    await expectError(await get("/niches/gibt-es-nicht"), 404, "NICHE_NOT_FOUND");
    await expectError(await get("/niches/entwurf"), 404, "NICHE_NOT_FOUND");
  });
});

describe("GET /api/v1/niches/:nicheSlug/gadgets/:gadgetSlug", () => {
  test("returns the gadget with its affiliate link and niche", async () => {
    const niche = await insertNiche(database.db);
    await insertGadget(database.db, niche.id);

    const response = await get("/niches/katzen/gadgets/trinkbrunnen");

    expect(response.status).toBe(200);
    expect(GadgetResponseSchema.parse(await response.json()).gadget).toEqual({
      slug: "trinkbrunnen",
      name: "Trinkbrunnen",
      tagline: "Fließendes Wasser.",
      description: "Erster Absatz.\n\nZweiter Absatz.",
      highlights: ["Leise", "Spülmaschinenfest"],
      imageUrl: null,
      merchantName: "Beispiel-Shop",
      affiliateUrl: "https://example.com/trinkbrunnen?tag=clever",
      niche: { slug: "katzen", name: "Katzen", emoji: "🐱", accentColor: "#b8a1ff" },
    });
  });

  test("allows the same gadget slug in different niches", async () => {
    const cats = await insertNiche(database.db, { slug: "katzen", name: "Katzen" });
    const dogs = await insertNiche(database.db, { slug: "hunde", name: "Hunde", emoji: "🐶" });
    await insertGadget(database.db, cats.id, { name: "Katzen-Brunnen" });
    await insertGadget(database.db, dogs.id, { name: "Hunde-Brunnen" });

    const catResponse = GadgetResponseSchema.parse(await (await get("/niches/katzen/gadgets/trinkbrunnen")).json());
    const dogResponse = GadgetResponseSchema.parse(await (await get("/niches/hunde/gadgets/trinkbrunnen")).json());

    expect(catResponse.gadget.name).toBe("Katzen-Brunnen");
    expect(dogResponse.gadget.name).toBe("Hunde-Brunnen");
  });

  test("returns 404 for unknown gadgets, unpublished gadgets, unpublished niches and the wrong niche", async () => {
    const cats = await insertNiche(database.db, { slug: "katzen" });
    const hidden = await insertNiche(database.db, { slug: "entwurf", is_published: false });
    await insertNiche(database.db, { slug: "hunde" });
    await insertGadget(database.db, cats.id, { slug: "versteckt", is_published: false });
    await insertGadget(database.db, hidden.id, { slug: "trinkbrunnen" });
    await insertGadget(database.db, cats.id, { slug: "trinkbrunnen" });

    await expectError(await get("/niches/katzen/gadgets/gibt-es-nicht"), 404, "GADGET_NOT_FOUND");
    await expectError(await get("/niches/katzen/gadgets/versteckt"), 404, "GADGET_NOT_FOUND");
    await expectError(await get("/niches/entwurf/gadgets/trinkbrunnen"), 404, "GADGET_NOT_FOUND");
    await expectError(await get("/niches/hunde/gadgets/trinkbrunnen"), 404, "GADGET_NOT_FOUND");
  });
});

describe("catalog constraints", () => {
  test("the database rejects affiliate links that are not http(s)", async () => {
    const niche = await insertNiche(database.db);

    await expect(insertGadget(database.db, niche.id, { affiliate_url: "javascript:alert(1)" })).rejects.toThrow();
  });
});
