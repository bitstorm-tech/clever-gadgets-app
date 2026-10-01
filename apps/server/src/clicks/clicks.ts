import { ErrorCode, type RecordClickRequest } from "@clever-gadgets/shared";
import { findPublishedGadgetId } from "../catalog/catalog";
import type { Db } from "../database/database";
import { AppError } from "../errors/app-error";

/** Speichert einen Klick auf den Affiliate-Link eines veröffentlichten Gadgets. Es werden keine Personendaten gespeichert. */
export async function recordGadgetClick(
  db: Db,
  nicheSlug: string,
  gadgetSlug: string,
  click: RecordClickRequest,
): Promise<void> {
  const gadgetId = await findPublishedGadgetId(db, nicheSlug, gadgetSlug);
  if (!gadgetId) throw new AppError(ErrorCode.GADGET_NOT_FOUND, `Gadget "${nicheSlug}/${gadgetSlug}" not found.`);

  await db
    .insertInto("gadget_clicks")
    .values({
      gadget_id: gadgetId,
      utm_source: click.utmSource ?? null,
      utm_medium: click.utmMedium ?? null,
      utm_campaign: click.utmCampaign ?? null,
    })
    .execute();
}
