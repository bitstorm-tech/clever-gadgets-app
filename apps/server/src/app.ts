import { Hono } from "hono";
import { requestId } from "hono/request-id";
import type { Logger } from "pino";
import { catalogRoutes } from "./catalog/catalog-routes";
import { clickRoutes } from "./clicks/click-routes";
import type { Db } from "./database/database";
import { healthRoutes } from "./health/health-routes";
import type { AppEnv } from "./http/app-env";
import { handleError, handleNotFound } from "./http/errors";
import { requestLogging } from "./http/request-logging";

export interface AppDependencies {
  db: Db;
  logger: Logger;
}

/** Baut die HTTP-Anwendung ohne Port zu binden, damit Tests `app.request()` direkt aufrufen können. */
export function createApp({ db, logger }: AppDependencies) {
  const api = new Hono<AppEnv>()
    .route("/", healthRoutes(db))
    .route("/", catalogRoutes(db))
    .route("/", clickRoutes(db));

  return new Hono<AppEnv>()
    .use(requestId())
    .use(requestLogging(logger))
    .route("/api/v1", api)
    .notFound(handleNotFound)
    .onError(handleError);
}
