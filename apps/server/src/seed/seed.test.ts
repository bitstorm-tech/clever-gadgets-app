import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { GadgetResponseSchema, NicheDetailResponseSchema, NichesResponseSchema } from "@clever-gadgets/shared";
import { createApp } from "../app";
import { migrate } from "../database/migrate";
import { createTestDatabase, silentLogger, type TestDatabase } from "../testing/test-database";
import { SAMPLE_CATALOG } from "./sample-catalog";
import { seedCatalog } from "./seed-catalog";

let database: TestDatabase;

function get(path: string) {
  return createApp({ db: database.db, logger: silentLogger }).request(`/api/v1${path}`);
}

beforeAll(async () => {
  database = await createTestDatabase();
  await migrate(database.sql, silentLogger);
}, 120_000);

afterAll(async () => {
  await database?.drop();
});

describe("seedCatalog", () => {
  test("loads the sample catalog and serves every page of it through the API", async () => {
    await seedCatalog(database.db, SAMPLE_CATALOG);

    const { niches } = NichesResponseSchema.parse(await (await get("/niches")).json());
    expect(niches.map((niche) => [niche.slug, niche.gadgetCount])).toEqual(
      SAMPLE_CATALOG.map((niche) => [niche.slug, niche.gadgets.length]),
    );

    for (const niche of SAMPLE_CATALOG) {
      const detail = NicheDetailResponseSchema.parse(await (await get(`/niches/${niche.slug}`)).json());
      expect(detail.gadgets.map((gadget) => gadget.slug)).toEqual(niche.gadgets.map((gadget) => gadget.slug));

      for (const gadget of niche.gadgets) {
        const response = await get(`/niches/${niche.slug}/gadgets/${gadget.slug}`);
        expect(response.status).toBe(200);
        const body = GadgetResponseSchema.parse(await response.json());
        expect(body.gadget.highlights).toEqual(gadget.highlights);
        expect(body.gadget.affiliateUrl).toBe(gadget.affiliateUrl);
      }
    }
  });

  test("is idempotent and restores edited sample data", async () => {
    await seedCatalog(database.db, SAMPLE_CATALOG);
    await database.db.updateTable("gadgets").set({ name: "Geändert" }).execute();

    await seedCatalog(database.db, SAMPLE_CATALOG);

    const gadgetCount = SAMPLE_CATALOG.reduce((sum, niche) => sum + niche.gadgets.length, 0);
    const rows = await database.db.selectFrom("gadgets").select("name").execute();
    expect(rows).toHaveLength(gadgetCount);
    expect(rows.map((row) => row.name)).not.toContain("Geändert");
    expect(await database.db.selectFrom("niches").select("id").execute()).toHaveLength(SAMPLE_CATALOG.length);
  });
});
