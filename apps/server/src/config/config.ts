import { z } from "zod";

/** Passt zur Datenbank aus docker-compose.yml. Wird in Produktion nie verwendet. */
const LOCAL_DATABASE_URL = "postgres://clevergadgets:clevergadgets@localhost:5434/clevergadgets";

const EnvSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3100),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_FORMAT: z.enum(["json", "text"]).optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>["APP_ENV"];

export interface Config {
  appEnv: AppEnv;
  port: number;
  databaseUrl: string;
  logLevel: z.infer<typeof EnvSchema>["LOG_LEVEL"];
  /** `json` oder lesbarer `text` (pino-pretty). Standard: `text` in Entwicklung, sonst `json`. */
  logFormat: "json" | "text";
}

/** Liest und prüft die Konfiguration. Wirft mit allen Problemen, wenn die Umgebung ungültig ist. */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid configuration:\n${z.prettifyError(parsed.error)}`);
  }
  const { APP_ENV, PORT, DATABASE_URL, LOG_LEVEL, LOG_FORMAT } = parsed.data;

  if (APP_ENV === "production" && !DATABASE_URL) {
    throw new Error("Invalid configuration: DATABASE_URL is required in production");
  }

  return {
    appEnv: APP_ENV,
    port: PORT,
    databaseUrl: DATABASE_URL ?? LOCAL_DATABASE_URL,
    logLevel: LOG_LEVEL,
    logFormat: LOG_FORMAT ?? (APP_ENV === "development" ? "text" : "json"),
  };
}
