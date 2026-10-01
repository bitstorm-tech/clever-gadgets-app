import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { ErrorResponseSchema } from "@clever-gadgets/shared";
import { sql } from "kysely";
import { createApp } from "../app";
import { migrate } from "../database/migrate";
import { insertGadget, insertNiche } from "../testing/catalog-fixtures";
import { createTestDatabase, silentLogger, type TestDatabase } from "../testing/test-database";

let database: TestDatabase;

function postClick(path: string, body: unknown) {
  return createApp({ db: database.db, logger: silentLogger }).request(`/api/v1${path}/clicks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const clicks = () => database.db.selectFrom("gadget_clicks").selectAll().execute();

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

describe("POST /api/v1/niches/:nicheSlug/gadgets/:gadgetSlug/clicks", () => {
  test("records a click with its UTM parameters", async () => {
    const niche = await insertNiche(database.db);
    const gadget = await insertGadget(database.db, niche.id);

    const response = await postClick("/niches/katzen/gadgets/trinkbrunnen", {
      utmSource: "instagram",
      utmMedium: "social",
      utmCampaign: "katzen-reel-1",
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    const rows = await clicks();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      gadget_id: gadget.id,
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "katzen-reel-1",
    });
    expect(rows[0]?.clicked_at).toBeInstanceOf(Date);
  });

  test("records a click without any UTM parameters", async () => {
    const niche = await insertNiche(database.db);
    await insertGadget(database.db, niche.id);

    const response = await postClick("/niches/katzen/gadgets/trinkbrunnen", {});

    expect(response.status).toBe(204);
    expect(await clicks()).toMatchObject([{ utm_source: null, utm_medium: null, utm_campaign: null }]);
  });

  test("returns 404 and stores nothing for gadgets that are not published", async () => {
    const niche = await insertNiche(database.db);
    await insertGadget(database.db, niche.id, { slug: "entwurf", is_published: false });

    for (const path of ["/niches/katzen/gadgets/gibt-es-nicht", "/niches/katzen/gadgets/entwurf", "/niches/x/gadgets/y"]) {
      const response = await postClick(path, {});
      expect(response.status).toBe(404);
      expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe("GADGET_NOT_FOUND");
    }
    expect(await clicks()).toHaveLength(0);
  });

  test("returns 400 for invalid bodies and stores nothing", async () => {
    const niche = await insertNiche(database.db);
    await insertGadget(database.db, niche.id);

    for (const body of ["not json", { utmSource: "x".repeat(101) }, { utmSource: "" }, { utmSource: 5 }]) {
      const response = await postClick("/niches/katzen/gadgets/trinkbrunnen", body);
      expect(response.status).toBe(400);
      expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe("VALIDATION_FAILED");
    }
    expect(await clicks()).toHaveLength(0);
  });
});
