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
    // Inserted in reverse name order, so the result proves that ties on sort order are broken by name.
    const dogs = await insertNiche(database.db, { slug: "dogs", name: "Dogs", sort_order: 10 });
    const cats = await insertNiche(database.db, { slug: "cats", name: "Cats", sort_order: 10 });
    await insertNiche(database.db, { slug: "garden", name: "Garden", sort_order: 0 });
    await insertNiche(database.db, { slug: "draft", name: "Draft", is_published: false });
    await insertGadget(database.db, cats.id, { slug: "a" });
    await insertGadget(database.db, cats.id, { slug: "b" });
    await insertGadget(database.db, cats.id, { slug: "c", is_published: false });
    await insertGadget(database.db, dogs.id, { slug: "d" });

    const response = await get("/niches");

    expect(response.status).toBe(200);
    const { niches } = NichesResponseSchema.parse(await response.json());
    expect(niches.map((niche) => [niche.slug, niche.gadgetCount])).toEqual([
      ["garden", 0],
      ["cats", 2],
      ["dogs", 1],
    ]);
    expect(niches[1]).toEqual({
      slug: "cats",
      name: "Cats",
      tagline: "Gadgets for cats",
      emoji: "🐱",
      accentColor: "#b8a1ff",
      gadgetCount: 2,
    });
  });
});

describe("GET /api/v1/niches/:nicheSlug", () => {
  test("returns the niche with its published gadgets in display order", async () => {
    const niche = await insertNiche(database.db);
    await insertGadget(database.db, niche.id, { slug: "second", name: "Second", sort_order: 20 });
    await insertGadget(database.db, niche.id, { slug: "first", name: "First", sort_order: 10, image_url: "/images/a.jpg" });
    await insertGadget(database.db, niche.id, { slug: "draft", name: "Draft", is_published: false });

    const response = await get("/niches/cats");

    expect(response.status).toBe(200);
    const body = NicheDetailResponseSchema.parse(await response.json());
    expect(body.niche).toEqual({
      slug: "cats",
      name: "Cats",
      tagline: "Gadgets for cats",
      description: "Everything for cats.",
      emoji: "🐱",
      accentColor: "#b8a1ff",
    });
    expect(body.gadgets.map((gadget) => gadget.slug)).toEqual(["first", "second"]);
    expect(body.gadgets[0]?.imageUrl).toBe("/images/a.jpg");
    expect(body.gadgets[1]?.imageUrl).toBeNull();
  });

  test("returns an empty gadget list for a niche without gadgets", async () => {
    await insertNiche(database.db);

    const response = await get("/niches/cats");

    expect(response.status).toBe(200);
    expect(NicheDetailResponseSchema.parse(await response.json()).gadgets).toEqual([]);
  });

  test("returns 404 for unknown and unpublished niches", async () => {
    await insertNiche(database.db, { slug: "draft", is_published: false });

    await expectError(await get("/niches/does-not-exist"), 404, "NICHE_NOT_FOUND");
    await expectError(await get("/niches/draft"), 404, "NICHE_NOT_FOUND");
  });
});

describe("GET /api/v1/niches/:nicheSlug/gadgets/:gadgetSlug", () => {
  test("returns the gadget with its affiliate link and niche", async () => {
    const niche = await insertNiche(database.db);
    await insertGadget(database.db, niche.id);

    const response = await get("/niches/cats/gadgets/water-fountain");

    expect(response.status).toBe(200);
    expect(GadgetResponseSchema.parse(await response.json()).gadget).toEqual({
      slug: "water-fountain",
      name: "Water Fountain",
      tagline: "Flowing water.",
      description: "First paragraph.\n\nSecond paragraph.",
      highlights: ["Quiet", "Dishwasher safe"],
      imageUrl: null,
      merchantName: "Example Shop",
      affiliateUrl: "https://example.com/water-fountain?tag=clever",
      niche: { slug: "cats", name: "Cats", emoji: "🐱", accentColor: "#b8a1ff" },
    });
  });

  test("allows the same gadget slug in different niches", async () => {
    const cats = await insertNiche(database.db, { slug: "cats", name: "Cats" });
    const dogs = await insertNiche(database.db, { slug: "dogs", name: "Dogs", emoji: "🐶" });
    await insertGadget(database.db, cats.id, { name: "Cat Fountain" });
    await insertGadget(database.db, dogs.id, { name: "Dog Fountain" });

    const catResponse = GadgetResponseSchema.parse(await (await get("/niches/cats/gadgets/water-fountain")).json());
    const dogResponse = GadgetResponseSchema.parse(await (await get("/niches/dogs/gadgets/water-fountain")).json());

    expect(catResponse.gadget.name).toBe("Cat Fountain");
    expect(dogResponse.gadget.name).toBe("Dog Fountain");
  });

  test("returns 404 for unknown gadgets, unpublished gadgets, unpublished niches and the wrong niche", async () => {
    const cats = await insertNiche(database.db, { slug: "cats" });
    const hidden = await insertNiche(database.db, { slug: "draft", is_published: false });
    await insertNiche(database.db, { slug: "dogs" });
    await insertGadget(database.db, cats.id, { slug: "hidden", is_published: false });
    await insertGadget(database.db, hidden.id, { slug: "water-fountain" });
    await insertGadget(database.db, cats.id, { slug: "water-fountain" });

    await expectError(await get("/niches/cats/gadgets/does-not-exist"), 404, "GADGET_NOT_FOUND");
    await expectError(await get("/niches/cats/gadgets/hidden"), 404, "GADGET_NOT_FOUND");
    await expectError(await get("/niches/draft/gadgets/water-fountain"), 404, "GADGET_NOT_FOUND");
    await expectError(await get("/niches/dogs/gadgets/water-fountain"), 404, "GADGET_NOT_FOUND");
  });
});

describe("catalog constraints", () => {
  test("the database rejects affiliate links that are not http(s)", async () => {
    const niche = await insertNiche(database.db);

    await expect(insertGadget(database.db, niche.id, { affiliate_url: "javascript:alert(1)" })).rejects.toThrow();
  });
});
