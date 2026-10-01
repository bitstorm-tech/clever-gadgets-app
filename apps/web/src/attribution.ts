import { MAX_UTM_LENGTH, type RecordClickRequest } from "@clever-gadgets/shared";

/** Origin of the visit from the UTM parameters of the entry URL, e.g. `?utm_source=instagram`. */
let attribution: RecordClickRequest = {};

function readParam(params: URLSearchParams, name: string): string | undefined {
  const value = params.get(name)?.trim().slice(0, MAX_UTM_LENGTH);
  return value || undefined;
}

/**
 * Remembers the UTM parameters of a URL for as long as the page stays open. Deliberately kept in memory only,
 * with no cookies or local storage. URLs without UTM parameters leave the remembered value unchanged.
 */
export function captureAttribution(search: string): void {
  const params = new URLSearchParams(search);
  const next = {
    utmSource: readParam(params, "utm_source"),
    utmMedium: readParam(params, "utm_medium"),
    utmCampaign: readParam(params, "utm_campaign"),
  };
  if (next.utmSource || next.utmMedium || next.utmCampaign) attribution = next;
}

export function currentAttribution(): RecordClickRequest {
  return attribution;
}
