import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import pino from "pino";
import postgres from "postgres";
import { connectDatabase, type DatabaseConnection } from "../database/database";

export const silentLogger = pino({ level: "silent" });

/**
 * Ein PostgreSQL-Container pro `bun test`-Prozess (alle Testdateien teilen sich den Prozess).
 * Der Reaper von Testcontainers entfernt ihn, wenn der Prozess endet.
 */
let container: Promise<StartedPostgreSqlContainer> | undefined;

function sharedContainer() {
  container ??= new PostgreSqlContainer("postgres:17-alpine").start();
  return container;
}

/**
 * Verbindungs-URL eines Servers, auf dem Testdatenbanken angelegt werden dürfen.
 * Mit `TEST_POSTGRES_URL` lässt sich ein schon laufender Server nutzen (z. B. ohne Docker).
 * Die Tests legen darauf nur neue Datenbanken `test_<uuid>` an und löschen sie wieder; andere bleiben unberührt.
 */
async function adminUrl(): Promise<string> {
  return process.env.TEST_POSTGRES_URL ?? (await sharedContainer()).getConnectionUri();
}

export interface TestDatabase extends DatabaseConnection {
  url: string;
  /** Schließt die Verbindungen und löscht die Datenbank. */
  drop(): Promise<void>;
}

/** Legt eine isolierte, leere Datenbank für eine Testdatei an. Migrationen werden nicht angewendet. */
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
