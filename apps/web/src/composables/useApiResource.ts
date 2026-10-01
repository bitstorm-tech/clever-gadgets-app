import { type ShallowRef, shallowRef, watchEffect } from "vue";
import { ApiError } from "../api/client";

export type ResourceStatus = "loading" | "ready" | "not-found" | "error";

export interface ApiResource<T> {
  data: Readonly<ShallowRef<T | null>>;
  status: Readonly<ShallowRef<ResourceStatus>>;
  /** Loads again, e.g. after an error. */
  reload: () => void;
}

/**
 * Loads data on mount and again whenever a reactive value that `load` reads directly changes
 * (e.g. a route parameter). Responses to outdated requests are discarded.
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

  // `load` is called synchronously inside the effect, so Vue tracks its reactive reads.
  watchEffect(() => {
    void run();
  });

  return { data, status, reload: () => void run() };
}
