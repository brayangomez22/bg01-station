/**
 * Tiny class-name combiner. Filters falsy values and joins with a space.
 * Used to compose BEM classes from CSS Modules, e.g.:
 *   cn(styles['mission-card'], isFeatured && styles['mission-card--featured'])
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
