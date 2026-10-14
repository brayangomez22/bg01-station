import { useCallback, useSyncExternalStore } from 'react';
import { mediaUp, type Breakpoint } from '@/lib/breakpoints';

/**
 * Subscribe to an arbitrary media query string. Reports false during the
 * prerender and hydration (no viewport to query), then the live value.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Convenience: true when viewport is at least the given breakpoint. */
export function useBreakpointUp(bp: Breakpoint): boolean {
  return useMediaQuery(mediaUp(bp));
}

/** True for fine-pointer (mouse) devices — gates hover-only effects. */
export function useHasHover(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}
