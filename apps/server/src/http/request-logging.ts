import { createMiddleware } from "hono/factory";
import type { Logger } from "pino";
import type { AppEnv } from "./app-env";

/** Bindet einen Logger pro Anfrage und loggt je abgeschlossener Anfrage eine Zeile. Braucht die requestId-Middleware. */
export function requestLogging(logger: Logger) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const requestLogger = logger.child({ requestId: c.get("requestId") });
    c.set("logger", requestLogger);

    const startedAt = performance.now();
    await next();

    requestLogger.info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs: Math.round(performance.now() - startedAt),
      },
      "request completed",
    );
  });
}
