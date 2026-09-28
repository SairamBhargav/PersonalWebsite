"use client";

import { useSyncExternalStore } from "react";

const stores = new Map<string, ReturnType<typeof createStore>>();

function mediaQueryStore(query: string) {
  let store = stores.get(query);
  if (!store) stores.set(query, (store = createStore(query)));
  return store;
}

function createStore(query: string) {
  return {
    subscribe(callback: () => void) {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    get: () => window.matchMedia(query).matches,
  };
}

export function useMediaQuery(query: string, serverFallback = false) {
  const store = mediaQueryStore(query);
  return useSyncExternalStore(store.subscribe, store.get, () => serverFallback);
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

const noopSubscribe = () => () => {};

/** True after hydration; avoids theme-dependent hydration mismatches. */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
