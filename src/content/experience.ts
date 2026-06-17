import type { Experience } from '@/types/domain';
import data from './_generated/experience.json';

/** Logbook entries (work history). Sourced from the generated bundle. */
export const experience = data as unknown as Experience[];
