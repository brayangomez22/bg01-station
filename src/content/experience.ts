import type { Experience } from '@/types/domain';

/** Logbook entries — captain's log of professional flight history. */
export const experience: Experience[] = [
  {
    id: 'log-2024-backend-lead',
    period: { start: '2024-01-01', end: 'present' },
    company: 'Estación de Desarrollo (actual)',
    role: 'Backend Developer',
    location: 'remote',
    summary:
      'Diseño y construcción de servicios backend en Go y NestJS para plataformas de alto tráfico.',
    responsibilities: [
      'Arquitectura de microservicios y APIs en Go y NestJS.',
      'Modelado de datos y optimización de consultas en MongoDB.',
      'Despliegue y operación de infraestructura en AWS.',
    ],
    achievements: [
      'Reducción de la latencia de servicios críticos en un 40%.',
      'Implementación de pipelines de CI/CD que aceleraron los despliegues.',
    ],
    technologies: ['go', 'nestjs', 'mongodb', 'aws', 'typescript'],
    type: 'full-time',
    order: 1,
  },
  {
    id: 'log-2022-fullstack',
    period: { start: '2022-01-01', end: '2023-12-01' },
    company: 'Órbita Tecnológica',
    role: 'Full-stack Developer',
    location: 'Híbrido',
    summary:
      'Desarrollo full-stack con NestJS y Angular para productos empresariales en tiempo real.',
    responsibilities: [
      'Construcción de APIs en NestJS con TypeScript.',
      'Desarrollo de SPAs en Angular con RxJS.',
      'Integración de WebSockets para funcionalidades en tiempo real.',
    ],
    achievements: [
      'Entrega de un panel de control de flota usado por +200 dispositivos.',
      'Mejora de la cobertura de tests del backend al 80%.',
    ],
    technologies: ['nestjs', 'angular', 'typescript', 'mongodb'],
    type: 'full-time',
    order: 2,
  },
  {
    id: 'log-2020-junior',
    period: { start: '2020-06-01', end: '2021-12-01' },
    company: 'Despegue Inicial',
    role: 'Junior Developer',
    location: 'Presencial',
    summary:
      'Inicio de la carrera: primeros servicios backend y bases sólidas en TypeScript y bases de datos.',
    responsibilities: [
      'Desarrollo de endpoints y mantenimiento de servicios existentes.',
      'Aprendizaje de buenas prácticas, testing y control de versiones.',
    ],
    achievements: [
      'Primer servicio en producción a los 6 meses.',
      'Adopción de TypeScript en el equipo.',
    ],
    technologies: ['typescript', 'mongodb', 'react'],
    type: 'full-time',
    order: 3,
  },
];
