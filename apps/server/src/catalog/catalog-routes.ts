import { Hono } from "hono";
import type { Db } from "../database/database";
import type { AppEnv } from "../http/app-env";
import { getGadget, getNiche, listNiches } from "./catalog";

export function catalogRoutes(db: Db) {
  return new Hono<AppEnv>()
    .get("/niches", async (c) => c.json(await listNiches(db)))
    .get("/niches/:nicheSlug", async (c) => c.json(await getNiche(db, c.req.param("nicheSlug"))))
    .get("/niches/:nicheSlug/gadgets/:gadgetSlug", async (c) =>
      c.json(await getGadget(db, c.req.param("nicheSlug"), c.req.param("gadgetSlug"))),
    );
}
