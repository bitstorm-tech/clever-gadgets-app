import { type ColumnType, type Generated, Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

/** Zeitstempel-Spalten mit Datenbank-Default: beim Einfügen optional, beim Lesen ein Date. */
type CreatedTimestamp = ColumnType<Date, Date | string | undefined, Date | string>;

/** Spalten mit Datenbank-Default: beim Einfügen optional. */
type WithDefault<T> = ColumnType<T, T | undefined, T>;

export interface NichesTable {
  id: Generated<string>;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  /** Hex-Farbe wie `#b8a1ff`, prägt die Seiten der Nische. */
  accent_color: string;
  sort_order: WithDefault<number>;
  is_published: WithDefault<boolean>;
  created_at: CreatedTimestamp;
  updated_at: CreatedTimestamp;
}

export interface GadgetsTable {
  id: Generated<string>;
  niche_id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: WithDefault<string[]>;
  image_url: string | null;
  merchant_name: string;
  affiliate_url: string;
  sort_order: WithDefault<number>;
  is_published: WithDefault<boolean>;
  created_at: CreatedTimestamp;
  updated_at: CreatedTimestamp;
}

export interface GadgetClicksTable {
  id: Generated<string>;
  gadget_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  clicked_at: CreatedTimestamp;
}

/** Kysely-Tabellentypen. Müssen zu den SQL-Migrationen passen. */
export interface DatabaseSchema {
  niches: NichesTable;
  gadgets: GadgetsTable;
  gadget_clicks: GadgetClicksTable;
}

export type Db = Kysely<DatabaseSchema>;

export interface DatabaseConnection {
  /** Roher postgres.js-Client, wird vom Migrations-Runner genutzt. */
  sql: postgres.Sql;
  db: Db;
  close(): Promise<void>;
}

export function connectDatabase(databaseUrl: string): DatabaseConnection {
  const sql = postgres(databaseUrl, {
    max: 10,
    connect_timeout: 5,
    onnotice: () => {},
  });
  const db = new Kysely<DatabaseSchema>({ dialect: new PostgresJSDialect({ postgres: sql }) });

  return {
    sql,
    db,
    async close() {
      await db.destroy();
      // Kysely startet seinen Treiber erst bei Bedarf; wurde nur der rohe Client genutzt, lässt destroy() den Pool offen.
      await sql.end();
    },
  };
}
