import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import pino from "pino";
import postgres from "postgres";
import { connectDatabase, type DatabaseConnection } from "../database/database";

export const silentLogger = pino({ level: "silent" });

/**
 * One PostgreSQL container per `bun test` process (all test files share the process).
 * The Testcontainers reaper removes it when the process ends.
 */
let container: Promise<StartedPostgreSqlContainer> | undefined;

function sharedContainer() {
  container ??= new PostgreSqlContainer("postgres:17-alpine").start();
  return container;
}

/**
 * Connection URL of a server on which test databases may be created.
 * With `TEST_POSTGRES_URL`, an already running server can be used (e.g. without Docker).
 * The tests only create new `test_<uuid>` databases there and drop them again; others stay untouched.
 */
async function adminUrl(): Promise<string> {
  return process.env.TEST_POSTGRES_URL ?? (await sharedContainer()).getConnectionUri();
}

export interface TestDatabase extends DatabaseConnection {
  url: string;
  /** Closes the connections and drops the database. */
  drop(): Promise<void>;
}

/** Creates an isolated, empty database for one test file. Migrations are not applied. */
export async function createTestDatabase(): Promise<TestDatabase> {
  const serverUrl = await adminUrl();
  const name = `test_${crypto.randomUUID().replaceAll("-", "")}`;

  const admin = postgres(serverUrl, { max: 1, onnotice: () => {} });
  await admin.unsafe(`create database ${name}`);
  await admin.end();

  const url = new URL(serverUrl);
  url.pathname = `/${name}`;
  const connection = connectDatabase(url.toString());

  return {
    ...connection,
    url: url.toString(),
    async drop() {
      await connection.close();
      const cleanup = postgres(serverUrl, { max: 1, onnotice: () => {} });
      await cleanup.unsafe(`drop database if exists ${name} with (force)`);
      await cleanup.end();
    },
  };
}
