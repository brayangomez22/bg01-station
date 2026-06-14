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

/**
 * Control center routes. Kept separate from the public ROUTES (the station's
 * narrative source of truth) because the control area is not a deck.
 */
export const CONTROL = {
  root: '/control',
  login: '/control/login',
  pilot: '/control/pilot',
  missions: '/control/missions',
  missionNew: '/control/missions/new',
  missionEdit: (id: string) => `/control/missions/${id}`,
} as const;
