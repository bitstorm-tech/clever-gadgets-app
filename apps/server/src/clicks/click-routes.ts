import { RecordClickRequestSchema } from "@clever-gadgets/shared";
import { Hono } from "hono";
import type { Db } from "../database/database";
import type { AppEnv } from "../http/app-env";
import { parseJsonBody } from "../http/parse-json-body";
import { recordGadgetClick } from "./clicks";

export function clickRoutes(db: Db) {
  return new Hono<AppEnv>().post("/niches/:nicheSlug/gadgets/:gadgetSlug/clicks", async (c) => {
    const click = await parseJsonBody(c, RecordClickRequestSchema);
    await recordGadgetClick(db, c.req.param("nicheSlug"), c.req.param("gadgetSlug"), click);
    return c.body(null, 204);
  });
}
