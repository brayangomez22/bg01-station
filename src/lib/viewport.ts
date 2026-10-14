/**
 * Viewport size readers that tolerate the build-time prerender (no window).
 * Meant for lazily evaluated callbacks (motion transforms, handlers); the
 * prerender fallback of 1px only avoids NaN, it is never painted.
 */
export const viewportWidth = (): number =>
  typeof window === 'undefined' ? 1 : window.innerWidth;

export const viewportHeight = (): number =>
  typeof window === 'undefined' ? 1 : window.innerHeight;
