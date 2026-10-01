import { currentAttribution } from "../attribution";

/**
 * Reports a click on the affiliate link. Errors are ignored on purpose:
 * the visitor should never wait for the counting, and the link itself works without it.
 */
export function trackGadgetClick(nicheSlug: string, gadgetSlug: string): void {
  const path = `/niches/${encodeURIComponent(nicheSlug)}/gadgets/${encodeURIComponent(gadgetSlug)}/clicks`;
  fetch(`/api/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentAttribution()),
    // The page is about to be left; keepalive lets the request finish anyway.
    keepalive: true,
  }).catch(() => {});
}
