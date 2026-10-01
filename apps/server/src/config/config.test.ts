import { describe, expect, test } from "bun:test";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  test("uses local defaults in development", () => {
    const config = loadConfig({});

    expect(config).toEqual({
      appEnv: "development",
      port: 3100,
      databaseUrl: "postgres://clevergadgets:clevergadgets@localhost:5434/clevergadgets",
      logLevel: "info",
      logFormat: "text",
    });
  });

  test("requires DATABASE_URL in production", () => {
    expect(() => loadConfig({ APP_ENV: "production" })).toThrow(/DATABASE_URL is required/);
  });

  test("accepts explicit production configuration", () => {
    const config = loadConfig({
      APP_ENV: "production",
      PORT: "8080",
      DATABASE_URL: "postgresql://user:pw@db.internal:5432/clevergadgets",
    });

    expect(config.port).toBe(8080);
    expect(config.databaseUrl).toBe("postgresql://user:pw@db.internal:5432/clevergadgets");
    expect(config.logFormat).toBe("json");
  });

  test("lets LOG_FORMAT override the default", () => {
    expect(loadConfig({ LOG_FORMAT: "json" }).logFormat).toBe("json");
    expect(() => loadConfig({ LOG_FORMAT: "xml" })).toThrow(/Invalid configuration/);
  });

  test("rejects invalid values", () => {
    expect(() => loadConfig({ PORT: "not-a-port" })).toThrow(/Invalid configuration/);
    expect(() => loadConfig({ DATABASE_URL: "mysql://localhost/db" })).toThrow(/Invalid configuration/);
    expect(() => loadConfig({ APP_ENV: "staging" })).toThrow(/Invalid configuration/);
  });
});
