/**
 * Single source of truth for route paths. Never write route strings inline.
 */
export const ROUTES = {
  bridge: '/',
  pilot: '/pilot',
  systems: '/systems',
  missions: '/missions',
  missionDetail: (id: string) => `/missions/${id}`,
  logbook: '/logbook',
  comms: '/comms',
  archive: '/archive',
  archiveRecord: (id: string) => `/archive/${id}`,
} as const;

/** Pattern form for route definitions. */
export const ROUTE_PATTERNS = {
  missionDetail: '/missions/:missionId',
  archiveRecord: '/archive/:recordId',
} as const;
