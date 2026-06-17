import type { Pilot } from '@/types/domain';
import data from './_generated/pilot.json';

/**
 * Pilot profile. Sourced from the generated bundle (the API is the source of
 * truth; CI regenerates _generated/ from /export on publish).
 */
export const pilot = data as unknown as Pilot;
