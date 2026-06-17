import type { TrainingSim } from '@/types/domain';
import data from './_generated/training.json';

/**
 * Hangar-level stats for the training log header. Not part of the CMS:
 * `totalSims` is the count of public repos on GitHub, maintained by hand
 * (no client-side API calls); refresh it occasionally.
 */
export const trainingLog = {
  totalSims: 191,
  sinceYear: 2020,
  hangarUrl: 'https://github.com/brayangomez22?tab=repositories',
};

/**
 * Curated selection: only practices that demonstrate something the missions
 * don't already cover. Sourced from the generated bundle.
 */
export const trainingSims = data as unknown as TrainingSim[];
