import type { RequestIdVariables } from "hono/request-id";
import type { Logger } from "pino";

/** Hono-Kontext-Typen, die alle Routen teilen. */
export interface AppEnv {
  Variables: RequestIdVariables & {
    /** Logger mit der ID der aktuellen Anfrage. */
    logger: Logger;
  };
}
