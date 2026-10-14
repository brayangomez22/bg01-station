import { lazy, type ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import { StationShell } from '@/app/layout/StationShell';
import { ControlShell } from '@/app/layout/ControlShell';
import { ControlGuard } from '@/features/control/components/ControlGuard';
import { ROUTES, ROUTE_PATTERNS, CONTROL, CONTROL_PATTERNS } from './paths';

/* First-visit pacing: the first time a deck's chunk loads mid-session, the
   telemetry loader (and its crew scene) holds long enough to be read.
   React.lazy only runs each factory once, so revisits never wait. The
   initial page load / deep links stay instant (first impression is the
   boot's job), and reduced-motion visitors are never held on decoration.
   The prerender (no window) never waits either. */
const APP_START = performance.now();
const SCENE_HOLD_MS = 1300;
const INITIAL_GRACE_MS = 1500;

function paced<T>(load: () => Promise<T>): Promise<T> {
  if (typeof window === 'undefined') return load();
  const isInitialLoad = performance.now() - APP_START < INITIAL_GRACE_MS;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isInitialLoad || reduced) return load();
  return Promise.all([
    load(),
    new Promise((resolve) => setTimeout(resolve, SCENE_HOLD_MS)),
  ]).then(([module]) => module);
}

type PageModule = { default: ComponentType };

/** A deck page: the lazy component plus its route handle.
    - `prefetch` warms the chunk on hover/focus (prefetch.ts); the first visit
      still goes through `paced()`, so the telemetry loader keeps its hold.
    - `preload` is awaited by main.tsx before hydrating a prerendered route.
      Once preloaded, the lazy factory hands React a synchronously-resolved
      thenable, so React.lazy renders the page in the hydration pass instead
      of suspending (a suspended boundary would be thrown away and
      client-rendered, losing the markup). */
function deckPage(load: () => Promise<PageModule>) {
  let loaded: PageModule | undefined;
  const preload = () => load().then((module) => (loaded = module));
  const Page = lazy(() => {
    const module = loaded;
    if (!module) return paced(load);
    return { then: (resolve: (m: PageModule) => void) => resolve(module) } as Promise<PageModule>;
  });
  return { element: <Page />, handle: { prefetch: load, preload } satisfies RouteHandle };
}

export interface RouteHandle {
  /** Download the route's chunk ahead of navigation. */
  prefetch?: () => Promise<unknown>;
  /** Load the chunk and let the lazy page render without suspending. */
  preload?: () => Promise<unknown>;
}

/* Lazy route components — one chunk per feature. Pages use default exports
   as required by React.lazy (documented exception to the named-export rule). */
const bridgePage = deckPage(() => import('@/features/bridge/BridgePage'));
const pilotPage = deckPage(() => import('@/features/pilot/PilotPage'));
const systemsPage = deckPage(() => import('@/features/systems/SystemsPage'));
const missionsPage = deckPage(() => import('@/features/missions/MissionsPage'));
const missionDetailPage = deckPage(() => import('@/features/missions/MissionDetailPage'));
const logbookPage = deckPage(() => import('@/features/logbook/LogbookPage'));
const commsPage = deckPage(() => import('@/features/comms/CommsPage'));
const archivePage = deckPage(() => import('@/features/archive/ArchivePage'));
const archiveRecordPage = deckPage(() => import('@/features/archive/ArchiveRecordPage'));
// Control center pages (lazy; loaded only when an admin visits /control).
const ControlLoginPage = lazy(() => import('@/features/control/LoginPage'));
const ControlOverviewPage = lazy(() => import('@/features/control/OverviewPage'));
const PilotEditorPage = lazy(() => import('@/features/control/pilot/PilotEditorPage'));
const MissionsListPage = lazy(
  () => import('@/features/control/missions/MissionsListPage'),
);
const MissionEditorPage = lazy(
  () => import('@/features/control/missions/MissionEditorPage'),
);
const TechnologiesListPage = lazy(
  () => import('@/features/control/technologies/TechnologiesListPage'),
);
const TechnologyEditorPage = lazy(
  () => import('@/features/control/technologies/TechnologyEditorPage'),
);
const ExperiencesListPage = lazy(
  () => import('@/features/control/experiences/ExperiencesListPage'),
);
const ExperienceEditorPage = lazy(
  () => import('@/features/control/experiences/ExperienceEditorPage'),
);
const FrequenciesListPage = lazy(
  () => import('@/features/control/frequencies/FrequenciesListPage'),
);
const FrequencyEditorPage = lazy(
  () => import('@/features/control/frequencies/FrequencyEditorPage'),
);
const SiteCopyListPage = lazy(
  () => import('@/features/control/site-copy/SiteCopyListPage'),
);
const SiteCopyEditorPage = lazy(
  () => import('@/features/control/site-copy/SiteCopyEditorPage'),
);
const ArchiveRecordsListPage = lazy(
  () => import('@/features/control/archive/ArchiveRecordsListPage'),
);
const ArchiveRecordEditorPage = lazy(
  () => import('@/features/control/archive/ArchiveRecordEditorPage'),
);
const ArchiveSectionsListPage = lazy(
  () => import('@/features/control/archive/ArchiveSectionsListPage'),
);
const ArchiveSectionEditorPage = lazy(
  () => import('@/features/control/archive/ArchiveSectionEditorPage'),
);

// 404 is eager (lightweight, must render even if a chunk fails to load).
import { NotFoundPage } from '@/features/not-found/NotFoundPage';

/**
 * Route table, shared by the browser router (main.tsx) and the build-time
 * prerender (entry-server.tsx). Never create the router here: the browser
 * router needs `window`, which the prerender doesn't have.
 */
export const routes: RouteObject[] = [
  {
    path: ROUTES.bridge,
    element: <StationShell />,
    children: [
      { index: true, ...bridgePage },
      { path: ROUTES.pilot, ...pilotPage },
      { path: ROUTES.systems, ...systemsPage },
      { path: ROUTES.missions, ...missionsPage },
      { path: ROUTE_PATTERNS.missionDetail, ...missionDetailPage },
      { path: ROUTES.logbook, ...logbookPage },
      { path: ROUTES.comms, ...commsPage },
      { path: ROUTES.archive, ...archivePage },
      { path: ROUTE_PATTERNS.archiveRecord, ...archiveRecordPage },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Control center: a sibling branch, not a deck. Public station chrome
    // (NavDock, deck transitions) never applies here. Children use absolute
    // paths from CONTROL / CONTROL_PATTERNS (paths.ts), never inline strings.
    path: CONTROL.root,
    element: <ControlShell />,
    children: [
      { path: CONTROL.login, element: <ControlLoginPage /> },
      {
        element: <ControlGuard />,
        children: [
          { index: true, element: <ControlOverviewPage /> },
          { path: CONTROL.pilot, element: <PilotEditorPage /> },
          { path: CONTROL.missions, element: <MissionsListPage /> },
          { path: CONTROL.missionNew, element: <MissionEditorPage /> },
          { path: CONTROL_PATTERNS.missionEdit, element: <MissionEditorPage /> },
          { path: CONTROL.technologies, element: <TechnologiesListPage /> },
          { path: CONTROL.technologyNew, element: <TechnologyEditorPage /> },
          { path: CONTROL_PATTERNS.technologyEdit, element: <TechnologyEditorPage /> },
          { path: CONTROL.experiences, element: <ExperiencesListPage /> },
          { path: CONTROL.experienceNew, element: <ExperienceEditorPage /> },
          { path: CONTROL_PATTERNS.experienceEdit, element: <ExperienceEditorPage /> },
          { path: CONTROL.frequencies, element: <FrequenciesListPage /> },
          { path: CONTROL.frequencyNew, element: <FrequencyEditorPage /> },
          { path: CONTROL_PATTERNS.frequencyEdit, element: <FrequencyEditorPage /> },
          { path: CONTROL.siteCopy, element: <SiteCopyListPage /> },
          { path: CONTROL.siteCopyNew, element: <SiteCopyEditorPage /> },
          { path: CONTROL_PATTERNS.siteCopyEdit, element: <SiteCopyEditorPage /> },
          { path: CONTROL.archive, element: <ArchiveRecordsListPage /> },
          { path: CONTROL.archiveNew, element: <ArchiveRecordEditorPage /> },
          { path: CONTROL.archiveSections, element: <ArchiveSectionsListPage /> },
          { path: CONTROL.archiveSectionNew, element: <ArchiveSectionEditorPage /> },
          { path: CONTROL_PATTERNS.archiveSectionEdit, element: <ArchiveSectionEditorPage /> },
          { path: CONTROL_PATTERNS.archiveEdit, element: <ArchiveRecordEditorPage /> },
        ],
      },
    ],
  },
];
