import type { Mission } from '@/types/domain';

/** Local blueprint-style cover, one per mission (public/covers/*.svg). */
const cover = (code: string, alt: string) => ({
  src: `/covers/${code.toLowerCase()}.svg`,
  alt,
  width: 1200,
  height: 675,
});

/**
 * NOTE: las métricas son estimaciones provisionales — se refinarán con
 * datos reales leyendo los repositorios de GitHub.
 */
export const missions: Mission[] = [
  {
    id: 'go-microservices-reengineering',
    code: 'M-005',
    title: 'Reingeniería de Microservicios Go',
    summary:
      'Reconstrucción de microservicios Go existentes y construcción de servicios nuevos desde cero en Hibot Chat, con arquitectura limpia y buenas prácticas.',
    description:
      'Reconstrucción progresiva de microservicios en Go que arrastraban deuda técnica, junto con el diseño y construcción de proyectos nuevos desde cero. Aplicación rigurosa de arquitectura limpia, principios SOLID y buenas prácticas de ingeniería para obtener servicios desacoplados, testeables y fáciles de mantener — sin interrumpir la operación del producto durante las reescrituras.',
    status: 'completed',
    role: 'Full Stack Developer · backend en Go',
    durationLabel: 'continuo · 4 años',
    period: { start: '2022-05-01', end: '2026-04-01' },
    technologies: ['go', 'docker', 'azure', 'mongodb'],
    highlights: [
      'Microservicios legados reconstruidos con arquitectura limpia, manteniendo compatibilidad de contratos.',
      'Servicios nuevos diseñados desde cero: desacoplados, testeables y listos para escalar.',
      'Estándares de ingeniería compartidos que elevaron la calidad de todo el backend.',
    ],
    challenges: [
      'Reescribir servicios en producción sin downtime ni romper a los consumidores.',
      'Equilibrar la reconstrucción con la entrega continua de features del producto.',
    ],
    metrics: [
      { label: 'Servicios reconstruidos', value: '8+' },
      { label: 'Desde cero', value: '4' },
      { label: 'Downtime en reescrituras', value: '0' },
    ],
    links: {},
    cover: cover(
      'M-005',
      'Esquemático de reingeniería: módulo legado fragmentado transferido a un núcleo de capas concéntricas de arquitectura limpia',
    ),
    featured: true,
    order: 1,
  },
  {
    id: 'recurring-payments-system',
    code: 'M-001',
    title: 'Sistema de Pagos Recurrentes',
    summary:
      'Integración de pasarelas de pago y motor de cobros recurrentes en Go que automatizó la facturación de Hibot Chat.',
    description:
      'Diseño e implementación del sistema de facturación del producto. Integración de pasarelas de pago de terceros y un motor de cobros recurrentes construido en Go con arquitectura limpia, con capa de idempotencia para evitar cargos duplicados y trazabilidad completa de cada transacción.',
    status: 'completed',
    role: 'Full Stack Developer · backend en Go',
    durationLabel: '7 meses',
    period: { start: '2023-01-01', end: '2023-08-01' },
    technologies: ['go', 'mongodb', 'azure'],
    highlights: [
      'Integración de pasarelas de pago de terceros con conciliación automática.',
      'Cobros recurrentes con idempotencia: cero cargos duplicados.',
      'Flujos de facturación 100% automatizados, sin intervención manual.',
    ],
    challenges: [
      'Garantizar consistencia en reintentos de cobro contra pasarelas externas.',
      'Diseñar la conciliación de estados entre el producto y cada proveedor de pago.',
    ],
    metrics: [
      { label: 'Cobros/mes', value: '12k+' },
      { label: 'Facturación manual', value: '0%' },
      { label: 'Cargos duplicados', value: '0' },
    ],
    links: {},
    cover: cover(
      'M-001',
      'Diagrama orbital del sistema de pagos: núcleo de transacciones con nodos de servicio e idempotencia',
    ),
    featured: true,
    order: 2,
  },
  {
    id: 'angular-react-migration',
    code: 'M-002',
    title: 'Migración Orbital Angular → React',
    summary:
      'Migración arquitectónica de los productos núcleo de Hibot Chat de Angular a React, módulo a módulo y sin detener el desarrollo.',
    description:
      'Lideré la migración de los proyectos núcleo de Angular a React. Estrategia incremental por módulos para mantener el producto operativo durante toda la transición, con un sistema de componentes reutilizables que elevó el rendimiento, la mantenibilidad y la velocidad del equipo.',
    status: 'completed',
    role: 'Líder técnico de la migración',
    durationLabel: '18 meses',
    period: { start: '2023-06-01', end: '2024-12-01' },
    technologies: ['react', 'angular', 'typescript'],
    highlights: [
      'Migración incremental módulo a módulo sin congelar el desarrollo de features.',
      'Sistema de componentes reutilizables compartido entre productos.',
      'Mejora medible de rendimiento y experiencia de desarrollo.',
    ],
    challenges: [
      'Convivencia de Angular y React durante la transición sin duplicar lógica.',
      'Paridad funcional sin regresiones en flujos críticos del producto.',
    ],
    metrics: [
      { label: 'Módulos migrados', value: '40+' },
      { label: 'Bundle inicial', value: '−38%' },
      { label: 'Tiempo de carga', value: '−40%' },
    ],
    links: {},
    cover: cover(
      'M-002',
      'Matriz de módulos del producto con traza de progreso de la migración',
    ),
    featured: true,
    order: 3,
  },
  {
    id: 'multichannel-bots',
    code: 'M-003',
    title: 'Red de Bots Multicanal',
    summary:
      'Bots e integraciones automatizadas para WhatsApp, Facebook, Instagram y Telegram conectados al núcleo de mensajería de Hibot.',
    description:
      'Desarrollo de integraciones y bots conversacionales para los cuatro canales principales de mensajería. Backend en Go bajo arquitectura hexagonal que normaliza las APIs dispares de cada canal, con agregaciones avanzadas en MongoDB para métricas de conversación.',
    status: 'completed',
    role: 'Junior Developer',
    durationLabel: '9 meses',
    period: { start: '2021-08-01', end: '2022-05-01' },
    technologies: ['go', 'typescript', 'mongodb'],
    highlights: [
      '4 canales integrados: WhatsApp, Facebook, Instagram y Telegram.',
      'Núcleo de ruteo en Go con arquitectura hexagonal.',
      'Pipelines de agregación en MongoDB para analítica de conversaciones.',
    ],
    challenges: [
      'Normalizar APIs y modelos de mensaje dispares entre canales.',
      'Resiliencia ante rate limits y caídas de cada plataforma.',
    ],
    metrics: [
      { label: 'Canales', value: '4' },
      { label: 'Conversaciones/día', value: '5k+' },
      { label: 'Operación', value: '24/7' },
    ],
    links: {},
    cover: cover(
      'M-003',
      'Núcleo hexagonal de ruteo de mensajes con anillo de canales conectados',
    ),
    featured: false,
    order: 4,
  },
  {
    id: 'rofe-platforms',
    code: 'M-004',
    title: 'Plataformas ROFÉ · Impacto Social',
    summary:
      'Mujeres ROFÉ y Jóvenes creaTIvos: plataformas para la independencia económica femenina y la formación laboral juvenil, desplegadas en Azure.',
    description:
      'Desarrollo freelance end-to-end de dos plataformas para la Fundación ROFÉ: Mujeres ROFÉ, orientada a la independencia económica de mujeres, y Jóvenes creaTIvos, enfocada en formación para el trabajo. Backend en NestJS, frontend en Angular y despliegues de producción en Microsoft Azure.',
    status: 'completed',
    role: 'Freelance Full Stack Developer',
    durationLabel: '15 meses',
    period: { start: '2021-03-01', end: '2022-06-01' },
    technologies: ['nestjs', 'angular', 'azure', 'mysql'],
    highlights: [
      'Dos plataformas en producción con impacto social directo.',
      'Entrega completa: diseño del sistema, desarrollo y despliegue en Azure.',
      'Interfaces pensadas para usuarias y usuarios no técnicos.',
    ],
    challenges: [
      'Cubrir todo el ciclo de desarrollo con un equipo mínimo.',
      'Equilibrar alcance y presupuesto de una fundación sin ánimo de lucro.',
    ],
    metrics: [
      { label: 'Plataformas', value: '2' },
      { label: 'Beneficiarios', value: '300+' },
      { label: 'Uptime', value: '99.9%' },
    ],
    links: {},
    cover: cover(
      'M-004',
      'Diagrama de flujo de las plataformas: registros, servicios y resultados de impacto',
    ),
    featured: false,
    order: 5,
  },
];

export const missionById = (id: string): Mission | undefined =>
  missions.find((m) => m.id === id);
