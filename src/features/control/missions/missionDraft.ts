import type { Mission } from '@/types/domain';

/** Mission status options for the editor select. */
export const MISSION_STATUS = [
  { value: 'completed', label: 'Completada' },
  { value: 'in-progress', label: 'En progreso' },
  { value: 'classified', label: 'Clasificada' },
] as const;

/** A blank mission with every field present, ready to edit. */
export function blankMission(): Mission {
  return {
    id: '',
    code: '',
    title: '',
    summary: '',
    description: '',
    status: 'completed',
    role: '',
    durationLabel: '',
    period: { start: '', end: '' },
    technologies: [],
    highlights: [],
    challenges: [],
    metrics: [],
    links: {},
    cover: { src: '', alt: '', width: 1200, height: 675 },
    gallery: [],
    featured: false,
    order: 0,
  };
}
