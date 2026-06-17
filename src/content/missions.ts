import type { Mission } from '@/types/domain';
import data from './_generated/missions.json';

/** Missions (projects). Sourced from the generated bundle. */
export const missions = data as unknown as Mission[];

/** Lookup helper. */
export const missionById = (id: string): Mission | undefined =>
  missions.find((m) => m.id === id);
