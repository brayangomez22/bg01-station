import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during the build-time prerender and the hydration render that must
 * match it; true afterwards (and immediately for components mounted later).
 * Gate any render output that depends on the browser — clock, storage, random
 * values — so the first client render reproduces the prerendered HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
