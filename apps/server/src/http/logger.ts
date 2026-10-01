import pino, { type Logger } from "pino";
import pretty from "pino-pretty";
import type { Config } from "../config/config";

/** Strukturierte JSON-Logs auf stdout, oder lesbare einzeilige Ausgabe über pino-pretty für lokales Arbeiten. */
export function createLogger(config: Pick<Config, "logLevel" | "logFormat" | "appEnv">): Logger {
  const options = {
    level: config.logLevel,
    base: { service: "clever-gadgets-server", env: config.appEnv },
  };
  if (config.logFormat === "json") return pino(options);

  // Als synchroner Stream statt als Worker-Thread-Transport, damit fatale Logs vor process.exit geschrieben sind.
  return pino(
    options,
    pretty({
      sync: true,
      singleLine: true,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
      ignore: "pid,hostname,service,env,requestId",
      messageFormat: "{if requestId}[{requestId}] {end}{msg}",
    }),
  );
}
