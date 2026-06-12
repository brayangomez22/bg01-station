import { useEffect, useState } from 'react';
import { mediaUp, type Breakpoint } from '@/lib/breakpoints';

/** Subscribe to an arbitrary media query string. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Convenience: true when viewport is at least the given breakpoint. */
export function useBreakpointUp(bp: Breakpoint): boolean {
  return useMediaQuery(mediaUp(bp));
}

/** True for fine-pointer (mouse) devices — gates hover-only effects. */
export function useHasHover(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}
