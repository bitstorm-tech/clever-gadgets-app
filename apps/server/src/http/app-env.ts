import type { RequestIdVariables } from "hono/request-id";
import type { Logger } from "pino";

/** Hono context types shared by all routes. */
export interface AppEnv {
  Variables: RequestIdVariables & {
    /** Logger carrying the ID of the current request. */
    logger: Logger;
  };
}
