import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sql } from "kysely";
import { createTestDatabase, type TestDatabase } from "../testing/test-database";
import { connectDatabase, type DatabaseConnection } from "./database";

let database: TestDatabase;

/** postgres.js-Abfragen sind faule Thenables; ein async-Wrapper macht daraus ein echtes Promise, das wirklich läuft. */
const selectOne = async (connection: DatabaseConnection) => connection.sql`select 1`;

beforeAll(async () => {
  database = await createTestDatabase();
}, 120_000);

afterAll(async () => {
  await database?.drop();
});

describe("connectDatabase().close", () => {
  // Regression: Ein offener Pool hält den Prozess am Leben, z. B. endet `bun run migrate` sonst nie.
  test("ends the pool when only the raw client was used", async () => {
    const connection = connectDatabase(database.url);
    await connection.sql`select 1`;

    await connection.close();

    await expect(selectOne(connection)).rejects.toMatchObject({ code: "CONNECTION_ENDED" });
  });

  test("ends the pool when Kysely was used", async () => {
    const connection = connectDatabase(database.url);
    await sql`select 1`.execute(connection.db);

    await connection.close();

    await expect(selectOne(connection)).rejects.toMatchObject({ code: "CONNECTION_ENDED" });
  });
});
