import type { Technology } from '@/types/domain';
import data from './_generated/technologies.json';

/**
 * Brayan's tech stack as orbiting planets. `usedInMissions` is derived at
 * export time. Sourced from the generated bundle (API is the source of truth).
 */
export const technologies = data as unknown as Technology[];

/** The five featured technologies, in display order: the Puente tags. */
export const featuredStack = technologies
  .filter((t) => t.featured)
  .sort((a, b) => a.order - b.order)
  .slice(0, 5);

/** Lookup helper. */
export const technologyById = (id: string): Technology | undefined =>
  technologies.find((t) => t.id === id);
