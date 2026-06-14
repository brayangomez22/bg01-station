import type { Experience } from '@/types/domain';

/** Employment type options for the editor select. */
export const EMPLOYMENT_TYPE = [
  { value: 'full-time', label: 'Tiempo completo' },
  { value: 'contract', label: 'Contrato' },
  { value: 'freelance', label: 'Freelance' },
] as const;

/** A blank experience with every field present, ready to edit. */
export function blankExperience(): Experience {
  return {
    id: '',
    period: { start: '', end: '' },
    company: '',
    role: '',
    location: '',
    summary: '',
    responsibilities: [],
    achievements: [],
    technologies: [],
    type: 'full-time',
    order: 0,
  };
}
