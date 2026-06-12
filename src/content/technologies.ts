import type { Technology } from '@/types/domain';

/**
 * Brayan's tech stack as orbiting planets.
 * `planet` params feed the (future) orbital visualization; they are
 * informational today and consumed by the 2D SystemView.
 */
export const technologies: Technology[] = [
  {
    id: 'go',
    name: 'Go',
    category: 'language',
    proficiency: 90,
    since: '2021-01-01',
    description:
      'Lenguaje principal para servicios backend de alto rendimiento, APIs concurrentes y microservicios.',
    planet: { color: '--color-accent', size: 'l', orbit: 1 },
    featured: true,
    order: 1,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'language',
    proficiency: 88,
    since: '2020-06-01',
    description:
      'Tipado estático en todo el stack: APIs con NestJS y frontends con Angular y React.',
    planet: { color: '--color-accent', size: 'l', orbit: 1 },
    featured: true,
    order: 2,
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    category: 'framework',
    proficiency: 85,
    since: '2021-03-01',
    description:
      'Framework backend para construir APIs modulares, escalables y testeables sobre Node.js.',
    planet: { color: '--color-secondary', size: 'm', orbit: 2 },
    featured: true,
    order: 3,
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'framework',
    proficiency: 80,
    since: '2020-01-01',
    description:
      'SPA empresariales con arquitectura robusta, RxJS y patrones de inyección de dependencias.',
    planet: { color: '--color-status-danger', size: 'm', orbit: 2 },
    featured: true,
    order: 4,
  },
  {
    id: 'react',
    name: 'React',
    category: 'framework',
    proficiency: 82,
    since: '2021-06-01',
    description:
      'Interfaces interactivas y portafolios inmersivos con un enfoque en rendimiento y DX.',
    planet: { color: '--color-accent', size: 'm', orbit: 2 },
    featured: true,
    order: 5,
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    proficiency: 84,
    since: '2020-09-01',
    description:
      'Modelado de datos documentales, agregaciones e índices para cargas de lectura intensiva.',
    planet: { color: '--color-status-ok', size: 'm', orbit: 3 },
    featured: true,
    order: 6,
  },
  {
    id: 'aws',
    name: 'AWS',
    category: 'cloud',
    proficiency: 78,
    since: '2021-09-01',
    description:
      'Despliegue y operación: EC2, Lambda, S3, ECS y CloudWatch para infraestructura cloud.',
    planet: { color: '--color-secondary', size: 'l', orbit: 4 },
    featured: true,
    order: 7,
  },
];

/** Lookup helper. */
export const technologyById = (id: string): Technology | undefined =>
  technologies.find((t) => t.id === id);
