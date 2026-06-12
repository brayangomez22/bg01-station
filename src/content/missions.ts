import type { Mission } from '@/types/domain';

/** Local blueprint-style cover, one per mission (public/covers/*.svg). */
const cover = (code: string, alt: string) => ({
  src: `/covers/${code.toLowerCase()}.svg`,
  alt,
  width: 1200,
  height: 675,
});

export const missions: Mission[] = [
  {
    id: 'orbital-payments-api',
    code: 'M-001',
    title: 'API de Pagos Orbital',
    summary:
      'Plataforma de pagos en Go capaz de procesar miles de transacciones concurrentes con consistencia garantizada.',
    description:
      'Diseño e implementación de una API de pagos de alto rendimiento. El núcleo en Go gestiona concurrencia mediante goroutines y canales, con una capa de idempotencia para evitar cargos duplicados y trazabilidad completa de cada transacción.',
    status: 'completed',
    role: 'Backend Developer principal',
    durationLabel: '4 meses',
    period: { start: '2024-02-01', end: '2024-06-01' },
    technologies: ['go', 'mongodb', 'aws'],
    highlights: [
      'Procesamiento de +5.000 transacciones concurrentes sin pérdida de consistencia.',
      'Sistema de idempotencia que eliminó los cargos duplicados.',
      'Despliegue en AWS ECS con auto-scaling según carga.',
    ],
    challenges: [
      'Garantizar atomicidad en operaciones distribuidas.',
      'Reducir la latencia p99 por debajo de 120 ms.',
    ],
    metrics: [
      { label: 'Latencia p99', value: '118 ms' },
      { label: 'Uptime', value: '99.95%' },
      { label: 'TPS pico', value: '5.2k' },
    ],
    links: {},
    cover: cover(
      'M-001',
      'Diagrama orbital de la API de pagos: núcleo de transacciones con nodos de servicio',
    ),
    featured: true,
    order: 1,
  },
  {
    id: 'fleet-control-panel',
    code: 'M-002',
    title: 'Panel de Control de Flota',
    summary:
      'Dashboard en tiempo real con Angular y NestJS para monitorear una flota de dispositivos IoT.',
    description:
      'Sistema de monitoreo en tiempo real. Backend en NestJS con WebSockets para telemetría en vivo y frontend en Angular con visualizaciones reactivas mediante RxJS. MongoDB almacena series temporales de cada dispositivo.',
    status: 'completed',
    role: 'Full-stack Developer',
    durationLabel: '6 meses',
    period: { start: '2023-05-01', end: '2023-11-01' },
    technologies: ['nestjs', 'angular', 'typescript', 'mongodb'],
    highlights: [
      'Telemetría en vivo vía WebSockets con < 1 s de retardo.',
      'Visualización reactiva de 200+ dispositivos simultáneos.',
      'Alertas configurables por umbrales de cada métrica.',
    ],
    challenges: [
      'Mantener el rendimiento del frontend con flujos de datos continuos.',
      'Modelar series temporales eficientes en MongoDB.',
    ],
    metrics: [
      { label: 'Dispositivos', value: '200+' },
      { label: 'Retardo telemetría', value: '<1s' },
    ],
    links: {},
    cover: cover(
      'M-002',
      'Matriz de dispositivos IoT con traza de telemetría en tiempo real',
    ),
    featured: true,
    order: 2,
  },
  {
    id: 'nebula-auth-service',
    code: 'M-003',
    title: 'Servicio de Autenticación Nebula',
    summary:
      'Microservicio de autenticación y autorización con JWT, refresh tokens y control de roles.',
    description:
      'Servicio de identidad reutilizable construido en NestJS y TypeScript. Implementa autenticación basada en JWT con rotación de refresh tokens, RBAC granular y auditoría de accesos. Desplegado como microservicio independiente en AWS.',
    status: 'completed',
    role: 'Backend Developer',
    durationLabel: '3 meses',
    period: { start: '2023-01-01', end: '2023-04-01' },
    technologies: ['nestjs', 'typescript', 'mongodb', 'aws'],
    highlights: [
      'RBAC granular con permisos por recurso.',
      'Rotación segura de refresh tokens.',
      'Reutilizado en 3 productos distintos.',
    ],
    challenges: [
      'Diseñar un modelo de permisos flexible y mantenible.',
      'Asegurar la invalidación de tokens comprometidos.',
    ],
    links: {},
    cover: cover('M-003', 'Compuerta hexagonal de autenticación con anillo de tokens'),
    featured: false,
    order: 3,
  },
  {
    id: 'cargo-analytics-pipeline',
    code: 'M-004',
    title: 'Pipeline de Analítica de Carga',
    summary:
      'Pipeline de procesamiento de datos en Go sobre AWS Lambda para análisis de logística.',
    description:
      'Pipeline serverless que ingiere, transforma y agrega grandes volúmenes de eventos logísticos. Funciones en Go sobre AWS Lambda procesan los eventos de forma elástica y los resultados se consolidan en MongoDB para consulta.',
    status: 'in-progress',
    role: 'Backend Developer',
    durationLabel: 'En curso',
    period: { start: '2025-01-01' },
    technologies: ['go', 'aws', 'mongodb'],
    highlights: [
      'Procesamiento serverless elástico con AWS Lambda.',
      'Funciones en Go para máxima eficiencia de cómputo.',
    ],
    challenges: [
      'Optimizar el cold-start de las funciones Lambda en Go.',
      'Diseñar agregaciones incrementales eficientes.',
    ],
    links: {},
    cover: cover(
      'M-004',
      'Diagrama del pipeline serverless: eventos, funciones lambda y agregados',
    ),
    featured: false,
    order: 4,
  },
];

export const missionById = (id: string): Mission | undefined =>
  missions.find((m) => m.id === id);
