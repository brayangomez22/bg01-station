import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { StationShell } from '@/app/layout/StationShell';
import { ControlShell } from '@/app/layout/ControlShell';
import { ControlGuard } from '@/features/control/components/ControlGuard';
import { ROUTES, ROUTE_PATTERNS, CONTROL } from './paths';

/* First-visit pacing: the first time a deck's chunk loads mid-session, the
   telemetry loader (and its crew scene) holds long enough to be read.
   React.lazy only runs each factory once, so revisits never wait. The
   initial page load / deep links stay instant (first impression is the
   boot's job), and reduced-motion visitors are never held on decoration. */
const APP_START = performance.now();
const SCENE_HOLD_MS = 1300;
const INITIAL_GRACE_MS = 1500;

function paced<T>(load: () => Promise<T>): Promise<T> {
  const isInitialLoad = performance.now() - APP_START < INITIAL_GRACE_MS;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isInitialLoad || reduced) return load();
  return Promise.all([
    load(),
    new Promise((resolve) => setTimeout(resolve, SCENE_HOLD_MS)),
  ]).then(([module]) => module);
}

/* Lazy route components — one chunk per feature. Pages use default exports
   as required by React.lazy (documented exception to the named-export rule). */
const BridgePage = lazy(() => paced(() => import('@/features/bridge/BridgePage')));
const PilotPage = lazy(() => paced(() => import('@/features/pilot/PilotPage')));
const SystemsPage = lazy(() => paced(() => import('@/features/systems/SystemsPage')));
const MissionsPage = lazy(() => paced(() => import('@/features/missions/MissionsPage')));
const MissionDetailPage = lazy(() =>
  paced(() => import('@/features/missions/MissionDetailPage')),
);
const LogbookPage = lazy(() => paced(() => import('@/features/logbook/LogbookPage')));
const CommsPage = lazy(() => paced(() => import('@/features/comms/CommsPage')));
const ArchivePage = lazy(() => paced(() => import('@/features/archive/ArchivePage')));
const ArchiveRecordPage = lazy(() =>
  paced(() => import('@/features/archive/ArchiveRecordPage')),
);
// Control center pages (lazy; loaded only when an admin visits /control).
const ControlLoginPage = lazy(() => import('@/features/control/LoginPage'));
const ControlOverviewPage = lazy(() => import('@/features/control/OverviewPage'));
const PilotEditorPage = lazy(() => import('@/features/control/pilot/PilotEditorPage'));
const MissionsListPage = lazy(() => import('@/features/control/missions/MissionsListPage'));
const MissionEditorPage = lazy(
  () => import('@/features/control/missions/MissionEditorPage'),
);

// 404 is eager (lightweight, must render even if a chunk fails to load).
import { NotFoundPage } from '@/features/not-found/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: ROUTES.bridge,
    element: <StationShell />,
    children: [
      { index: true, element: <BridgePage /> },
      { path: ROUTES.pilot, element: <PilotPage /> },
      { path: ROUTES.systems, element: <SystemsPage /> },
      { path: ROUTES.missions, element: <MissionsPage /> },
      { path: ROUTE_PATTERNS.missionDetail, element: <MissionDetailPage /> },
      { path: ROUTES.logbook, element: <LogbookPage /> },
      { path: ROUTES.comms, element: <CommsPage /> },
      { path: ROUTES.archive, element: <ArchivePage /> },
      { path: ROUTE_PATTERNS.archiveRecord, element: <ArchiveRecordPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Control center: a sibling branch, not a deck. Public station chrome
    // (NavDock, deck transitions) never applies here.
    path: CONTROL.root,
    element: <ControlShell />,
    children: [
      { path: 'login', element: <ControlLoginPage /> },
      {
        element: <ControlGuard />,
        children: [
          { index: true, element: <ControlOverviewPage /> },
          { path: 'pilot', element: <PilotEditorPage /> },
          { path: 'missions', element: <MissionsListPage /> },
          { path: 'missions/new', element: <MissionEditorPage /> },
          { path: 'missions/:missionId', element: <MissionEditorPage /> },
        ],
      },
    ],
  },
]);
