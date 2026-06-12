import { ROUTES } from './paths';

/**
 * Hover/focus prefetch map: importing the module warms Vite's module cache
 * and downloads the route chunk before navigation. Mirrors routes.tsx.
 */
const loaders: Record<string, () => Promise<unknown>> = {
  [ROUTES.bridge]: () => import('@/features/bridge/BridgePage'),
  [ROUTES.pilot]: () => import('@/features/pilot/PilotPage'),
  [ROUTES.systems]: () => import('@/features/systems/SystemsPage'),
  [ROUTES.missions]: () => import('@/features/missions/MissionsPage'),
  [ROUTES.logbook]: () => import('@/features/logbook/LogbookPage'),
  [ROUTES.comms]: () => import('@/features/comms/CommsPage'),
  [ROUTES.archive]: () => import('@/features/archive/ArchivePage'),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string): void {
  if (prefetched.has(path)) return;
  const loader = loaders[path];
  if (!loader) return;
  prefetched.add(path);
  // Fire-and-forget; ignore network errors (will retry on real navigation).
  void loader().catch(() => prefetched.delete(path));
}
