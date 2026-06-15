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
  technologies: '/control/technologies',
  technologyNew: '/control/technologies/new',
  technologyEdit: (id: string) => `/control/technologies/${id}`,
  experiences: '/control/experiences',
  experienceNew: '/control/experiences/new',
  experienceEdit: (id: string) => `/control/experiences/${id}`,
  frequencies: '/control/frequencies',
  frequencyNew: '/control/frequencies/new',
  frequencyEdit: (id: string) => `/control/frequencies/${id}`,
  siteCopy: '/control/site-copy',
  siteCopyNew: '/control/site-copy/new',
  siteCopyEdit: (key: string) => `/control/site-copy/${encodeURIComponent(key)}`,
  archive: '/control/archive',
  archiveNew: '/control/archive/new',
  archiveEdit: (id: string) => `/control/archive/${id}`,
  archiveSections: '/control/archive/sections',
  archiveSectionNew: '/control/archive/sections/new',
  archiveSectionEdit: (id: string) => `/control/archive/sections/${id}`,
} as const;
