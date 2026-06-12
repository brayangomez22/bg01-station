/**
 * Breakpoint values mirrored from styles/tokens/breakpoints.css.
 * Single source of truth for JS-side media queries (useMediaQuery).
 */
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const mediaUp = (bp: Breakpoint): string => `(min-width: ${breakpoints[bp]}px)`;
