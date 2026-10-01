import { type ShallowRef, shallowRef, watchEffect } from "vue";
import { ApiError } from "../api/client";

export type ResourceStatus = "loading" | "ready" | "not-found" | "error";

export interface ApiResource<T> {
  data: Readonly<ShallowRef<T | null>>;
  status: Readonly<ShallowRef<ResourceStatus>>;
  /** Lädt erneut, z. B. nach einem Fehler. */
  reload: () => void;
}

/**
 * Lädt Daten beim Einbinden und neu, sobald sich ein reaktiver Wert ändert, den `load` direkt liest
 * (z. B. ein Route-Parameter). Antworten veralteter Anfragen werden verworfen.
 */
export function useApiResource<T>(load: () => Promise<T>): ApiResource<T> {
  const data = shallowRef<T | null>(null);
  const status = shallowRef<ResourceStatus>("loading");
  let latestRequest = 0;

  async function run(): Promise<void> {
    const request = ++latestRequest;
    status.value = "loading";
    try {
      const result = await load();
      if (request !== latestRequest) return;
      data.value = result;
      status.value = "ready";
    } catch (error) {
      if (request !== latestRequest) return;
      data.value = null;
      status.value = error instanceof ApiError && error.isNotFound ? "not-found" : "error";
    }
  }

  // `load` wird synchron im Effekt aufgerufen, daher verfolgt Vue dessen reaktive Zugriffe.
  watchEffect(() => {
    void run();
  });

  return { data, status, reload: () => void run() };
}
