import type { Technology } from '@/types/domain';

/** Technology category options for the editor select. */
export const TECH_CATEGORY = [
  { value: 'language', label: 'Lenguaje' },
  { value: 'framework', label: 'Framework' },
  { value: 'database', label: 'Base de datos' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'tooling', label: 'Herramientas' },
] as const;

/** Planet size options (orbital visualization). */
export const PLANET_SIZE = [
  { value: 's', label: 'Pequeño' },
  { value: 'm', label: 'Mediano' },
  { value: 'l', label: 'Grande' },
] as const;

/** A blank technology with every field present, ready to edit. */
export function blankTechnology(): Technology {
  return {
    id: '',
    name: '',
    category: 'language',
    proficiency: 80,
    since: '',
    description: '',
    planet: { color: '--color-accent', size: 'm', orbit: 1 },
    featured: false,
    order: 0,
  };
}
