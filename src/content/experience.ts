import type { Experience } from '@/types/domain';

/** Logbook entries — captain's log of professional flight history. */
export const experience: Experience[] = [
  {
    id: 'log-2022-hibot-fullstack',
    period: { start: '2022-05-01', end: '2026-04-01' },
    company: 'Hibot Chat',
    role: 'Full Stack Developer',
    location: 'Medellín, Colombia',
    summary:
      'Desarrollo full-stack del producto de mensajería: microservicios en Go, migración del frontend de Angular a React e integraciones de pago.',
    responsibilities: [
      'Lideré la migración arquitectónica de los proyectos núcleo de Angular a React.',
      'Diseño e implementación de APIs REST y microservicios en Go con arquitectura limpia.',
      'Integración de pasarelas de pago de terceros y diseño del sistema de cobros recurrentes.',
      'Optimización de CI/CD y automatización de despliegues con Azure DevOps y Docker.',
      'Participación en decisiones de arquitectura, estimaciones técnicas y ceremonias ágiles.',
    ],
    achievements: [
      'Reingeniería de microservicios en Go: servicios legados reconstruidos y nuevos proyectos desde cero.',
      'Migración Angular → React que mejoró rendimiento, mantenibilidad y reutilización de componentes.',
      'Sistema de pagos recurrentes que automatizó por completo los flujos de facturación.',
    ],
    technologies: ['go', 'react', 'angular', 'typescript', 'mongodb', 'azure', 'docker'],
    type: 'full-time',
    order: 1,
  },
  {
    id: 'log-2021-hibot-junior',
    period: { start: '2021-05-01', end: '2022-05-01' },
    company: 'Hibot Chat',
    role: 'Junior Developer',
    location: 'Medellín, Colombia',
    summary:
      'Primer puesto de vuelo: frontend en Angular con NgRx, backend en Go y bots multicanal.',
    responsibilities: [
      'Desarrollo de aplicaciones web responsivas en Angular con manejo de estado en NgRx.',
      'Contribuciones al backend en Go bajo arquitectura hexagonal.',
      'Desarrollo de integraciones automatizadas y bots para WhatsApp, Facebook, Instagram y Telegram.',
    ],
    achievements: [
      'Bots conversacionales operando en 4 canales de mensajería.',
      'Pipelines de agregación avanzados en MongoDB para procesamiento de datos de alto rendimiento.',
    ],
    technologies: ['angular', 'go', 'typescript', 'mongodb'],
    type: 'full-time',
    order: 2,
  },
  {
    id: 'log-2021-freelance',
    period: { start: '2021-01-01', end: '2022-12-01' },
    company: 'Freelance · Fundación ROFÉ & KIMSA',
    role: 'Full Stack Developer',
    location: 'remote',
    summary:
      'Soluciones digitales para impacto social (Fundación ROFÉ) y sistemas empresariales para consultoría de cambio climático (KIMSA).',
    responsibilities: [
      'Desarrollo de la plataforma Mujeres ROFÉ y del sistema Jóvenes creaTIvos para la Fundación ROFÉ.',
      'Sistemas de información administrativos para KIMSA: backend en NestJS, frontends en Angular y React.',
      'Integración de sistemas desacoplados vía APIs REST y despliegues en Azure, Heroku y Hostinger.',
    ],
    achievements: [
      'Plataformas en producción apoyando la independencia económica de mujeres y la formación laboral de jóvenes.',
      'Entrega end-to-end: del diseño del sistema al despliegue en producción.',
    ],
    technologies: ['nestjs', 'angular', 'react', 'typescript', 'mysql', 'azure'],
    type: 'freelance',
    order: 3,
  },
];
