import { ROUTES } from './paths';

/**
 * Single source of truth for the station's vertical layout: which route is
 * which deck. The HUD stamp, the NavDock and the directional route
 * transition all derive from this list — never duplicate route→deck logic.
 */
export interface Deck {
  /** Position in the station stack (00 top … 06 bottom). */
  index: number;
  /** Stamped two-digit code ('03'). */
  code: string;
  /** Diegetic name ('Misiones'). */
  name: string;
  /** Non-diegetic translation so recruiters never need to decode the fiction. */
  hint: string;
  route: string;
}

export const DECKS: Deck[] = [
  { index: 0, code: '00', name: 'Puente', hint: 'Inicio', route: ROUTES.bridge },
  { index: 1, code: '01', name: 'Piloto', hint: 'Sobre mí', route: ROUTES.pilot },
  { index: 2, code: '02', name: 'Sistemas', hint: 'Tecnologías', route: ROUTES.systems },
  { index: 3, code: '03', name: 'Misiones', hint: 'Proyectos', route: ROUTES.missions },
  { index: 4, code: '04', name: 'Bitácora', hint: 'Experiencia', route: ROUTES.logbook },
  { index: 5, code: '05', name: 'Comms', hint: 'Contacto', route: ROUTES.comms },
  { index: 6, code: '06', name: 'Archivo', hint: 'Blog técnico', route: ROUTES.archive },
];

/** Deck containing a pathname; nested routes (/missions/:id) stay on deck. */
export function deckOf(pathname: string): Deck {
  return (
    DECKS.find((d) => d.route !== ROUTES.bridge && pathname.startsWith(d.route)) ??
    DECKS[0]
  );
}

/**
 * Travel direction between decks: 1 = descending (toward higher deck
 * numbers), -1 = ascending, 0 = same deck (e.g. opening a mission detail).
 */
export function travelDirection(fromIndex: number, toIndex: number): -1 | 0 | 1 {
  return Math.sign(toIndex - fromIndex) as -1 | 0 | 1;
}
