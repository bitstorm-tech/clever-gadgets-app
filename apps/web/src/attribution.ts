import { MAX_UTM_LENGTH, type RecordClickRequest } from "@clever-gadgets/shared";

/** Herkunft des Besuchs aus den UTM-Parametern der Einstiegsadresse, z. B. `?utm_source=instagram`. */
let attribution: RecordClickRequest = {};

function readParam(params: URLSearchParams, name: string): string | undefined {
  const value = params.get(name)?.trim().slice(0, MAX_UTM_LENGTH);
  return value || undefined;
}

/**
 * Merkt sich die UTM-Parameter einer Adresse, solange die Seite geöffnet ist. Bewusst nur im Arbeitsspeicher,
 * ohne Cookies oder Local Storage. Adressen ohne UTM-Parameter ändern nichts am gemerkten Wert.
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
