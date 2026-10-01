import { currentAttribution } from "../attribution";

/**
 * Meldet einen Klick auf den Affiliate-Link. Fehler werden bewusst ignoriert:
 * Der Besucher soll nie auf die Zählung warten, und der Link selbst funktioniert auch ohne sie.
 */
export function trackGadgetClick(nicheSlug: string, gadgetSlug: string): void {
  const path = `/niches/${encodeURIComponent(nicheSlug)}/gadgets/${encodeURIComponent(gadgetSlug)}/clicks`;
  fetch(`/api/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentAttribution()),
    // Die Seite wird gleich verlassen; mit keepalive läuft die Anfrage trotzdem zu Ende.
    keepalive: true,
  }).catch(() => {});
}
