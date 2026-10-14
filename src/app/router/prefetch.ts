import { matchRoutes } from 'react-router-dom';
import { routes, type RouteHandle } from './routes';

/**
 * Hover/focus prefetch: downloads the chunks of the route that `path`
 * matches (any deck or detail page) before navigation, via each route's
 * `handle.prefetch` in routes.tsx.
 */
const prefetched = new Set<string>();

export function prefetchRoute(path: string): void {
  if (prefetched.has(path)) return;
  prefetched.add(path);
  const loads = (matchRoutes(routes, path) ?? []).map((m) =>
    (m.route.handle as RouteHandle | undefined)?.prefetch?.(),
  );
  // Fire-and-forget; ignore network errors (will retry on real navigation).
  void Promise.all(loads).catch(() => prefetched.delete(path));
}
