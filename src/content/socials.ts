import type { Frequency } from '@/types/domain';
import data from './_generated/frequencies.json';

/** Communication channels — "frequencies" to reach the station. */
export const frequencies = data as unknown as Frequency[];
