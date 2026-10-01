import { type ColumnType, type Generated, Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

/** Timestamp columns with a database default: optional on insert, a Date when read. */
type CreatedTimestamp = ColumnType<Date, Date | string | undefined, Date | string>;

/** Columns with a database default: optional on insert. */
type WithDefault<T> = ColumnType<T, T | undefined, T>;

export interface NichesTable {
  id: Generated<string>;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  /** Hex color like `#b8a1ff`, shapes the pages of the niche. */
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

/** Kysely table types. Must match the SQL migrations. */
export interface DatabaseSchema {
  niches: NichesTable;
  gadgets: GadgetsTable;
  gadget_clicks: GadgetClicksTable;
}

export type Db = Kysely<DatabaseSchema>;

export interface DatabaseConnection {
  /** Raw postgres.js client, used by the migration runner. */
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
      // Kysely only starts its driver on demand; if only the raw client was used, destroy() leaves the pool open.
      await sql.end();
    },
  };
}
