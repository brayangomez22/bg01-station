/**
 * One-shot content update for October 2026 (run with tsx).
 *
 * Applies docs/actualizacion-contenido-2026-10.md to the bg01-api database
 * through the admin endpoints: Piloto, Sistemas, Misiones and Bitácora.
 *
 * Dry-run by default: it backs up GET /export into backups/, computes the
 * target state from the live content and prints a field-by-field diff. With
 * --apply it then asks for the admin password on the terminal (no echo, never
 * stored or printed), PUTs only the records that changed and re-reads /export
 * to verify. It is idempotent: a second run reports no changes. It never calls
 * /admin/publish — publishing stays a manual step in /control.
 *
 *   API_BASE=https://api.brayangomez.dev npx tsx scripts/apply-content-update.ts
 *   API_BASE=https://api.brayangomez.dev npx tsx scripts/apply-content-update.ts --apply
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type {
  ArchiveRecord,
  Experience,
  Mission,
  Pilot,
  Technology,
} from '../src/types/domain';
import type { LabelledValue, MediaRef } from '../src/types/common';

const BASE = process.env.API_BASE ?? 'http://localhost:8080';
const APPLY = process.argv.includes('--apply');
/** Write the target missions and archive into src/content/_generated/ to
    review them locally before applying. Never touches the API; undo with
    `git checkout src/content/_generated`. */
const PREVIEW_LOCAL = process.argv.includes('--preview-local');

/** Admin row: the frontend type plus the list order the API keeps. */
type ArchiveRecordRow = ArchiveRecord & { order: number };

interface Bundle {
  pilot: Pilot;
  technologies: Technology[];
  missions: Mission[];
  experience: Experience[];
  archiveRecords: ArchiveRecordRow[];
}

// ── target content ───────────────────────────────────────────────────────────

const BIO =
  'Desarrollador Full Stack con 5+ años en Go y Java. Construyo con agentes de IA bajo un proceso claro (spec, plan aprobado, tests primero y revisión humana) y construyo servicios que los agentes pueden usar de forma segura (MCP).';

const FREELANCE_PERIOD = { start: '2020-01-01', end: '2021-04-01' };

type NewTechnology = Omit<Technology, 'usedInMissions' | 'order'>;

const NEW_TECHNOLOGIES: NewTechnology[] = [
  {
    id: 'java',
    name: 'Java',
    category: 'language',
    since: '2021-05-01',
    description:
      'Backend empresarial en Hibot Chat; servicios que luego migré a Go manteniendo ambos en producción durante la transición.',
    planet: { color: '--color-status-danger', size: 'l', orbit: 1 },
    featured: true,
  },
  {
    id: 'spring-boot',
    name: 'Spring Boot',
    category: 'framework',
    since: '2021-05-01',
    description:
      'Spring MVC, Spring Data JPA, Hibernate y JUnit en los microservicios legacy de Hibot Chat.',
    planet: { color: '--color-status-ok', size: 'm', orbit: 2 },
    featured: false,
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    since: '2026-08-01',
    description:
      'Multi-tenant con Row-Level Security, PostGIS y bloqueos FOR UPDATE contra concurrencia.',
    planet: { color: '--color-accent', size: 'm', orbit: 2 },
    featured: false,
  },
  {
    id: 'mcp',
    name: 'IA (MCP)',
    category: 'tooling',
    since: '2026-10-01',
    description:
      'Model Context Protocol: servidores MCP con autorización OAuth2, tools filtradas por scope y confirmación humana para acciones sensibles.',
    planet: { color: '--color-accent', size: 'm', orbit: 1 },
    featured: true,
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    category: 'tooling',
    since: '2026-06-01',
    description:
      'Desarrollo con agentes: CLAUDE.md por proyecto, comandos propios (rama → plan aprobado → tests en rojo → implementación) y revisión humana de cada PR.',
    planet: { color: '--color-secondary', size: 's', orbit: 2 },
    featured: false,
  },
  {
    id: 'observability',
    name: 'Prometheus · Grafana · Loki',
    category: 'tooling',
    since: '2023-01-01',
    description:
      'Observabilidad con OpenTelemetry, dashboards, alertas y SLOs como código.',
    planet: { color: '--color-status-ok', size: 's', orbit: 4 },
    featured: false,
  },
  {
    id: 'terraform',
    name: 'Terraform',
    category: 'cloud',
    since: '2026-10-01',
    description: 'Infraestructura como código: colas SQS con DLQ, VPC y EKS.',
    planet: { color: '--color-secondary', size: 's', orbit: 4 },
    featured: false,
  },
];

/** Final technology order: the first five featured ones feed the Puente tags. */
const TECH_ORDER = [
  'go',
  'java',
  'react',
  'angular',
  'mcp',
  'typescript',
  'spring-boot',
  'postgresql',
  'nestjs',
  'claude-code',
  'docker',
  'mongodb',
  'azure',
  'observability',
  'terraform',
  'redis',
  'mysql',
];

const cover = (code: string, alt: string) => ({
  src: `/covers/${code.toLowerCase()}.svg`,
  alt,
  width: 1200,
  height: 675,
});

type NewMission = Omit<Mission, 'order'>;

const NEW_MISSIONS: NewMission[] = [
  {
    id: 'cuadra',
    code: 'M-007',
    title: 'Cuadra · SaaS de gestión para pymes',
    summary:
      'SaaS multi-tenant para comercios colombianos (punto de venta, inventario y caja) en Go y PostgreSQL con Row-Level Security. Desarrollado con Claude Code: plan aprobado, tests en rojo y revisión humana de cada PR.',
    description:
      'SaaS multi-tenant de gestión para comercios colombianos (ferreterías, tiendas, droguerías, almacenes), en desarrollo activo. Monolito modular en Go con arquitectura hexagonal, PostgreSQL con Row-Level Security para aislar a cada comercio, API contract-first con OpenAPI y trabajos en segundo plano con River. Observabilidad con OpenTelemetry, Prometheus, Loki, Tempo y Grafana, con alertas y SLOs como código. Desarrollado con Claude Code mediante comandos propios que imponen rama → plan aprobado → tests en rojo → implementación → verificación, con revisión humana de cada PR. En curso: infraestructura con Terraform, pruebas end-to-end y de carga, y facturación electrónica ante la DIAN.',
    status: 'in-progress',
    role: 'Desarrollador único · producto propio',
    durationLabel: 'En curso',
    period: { start: '2026-10-01' },
    technologies: [
      'go',
      'postgresql',
      'react',
      'typescript',
      'docker',
      'observability',
      'claude-code',
    ],
    highlights: [
      'Aislamiento multi-tenant en la propia base de datos con Row-Level Security de PostgreSQL.',
      'Punto de venta con lector de código de barras, pagos mixtos, tirilla térmica y cierre de caja a ciegas.',
      'CI con golangci-lint, govulncheck, gosec y Trivy; tests de integración con testcontainers.',
    ],
    challenges: [
      'Un núcleo genérico que sirva a una ferretería, una droguería o un almacén de ropa por configuración, no con forks.',
      'Sostener calidad de producción desarrollando con agentes de IA: cada cambio pasa por plan aprobado, tests en rojo y revisión humana.',
    ],
    metrics: [
      { label: 'PRs revisados', value: '40+' },
      { label: 'Archivos de tests', value: '110+' },
      { label: 'Fase hacia el piloto', value: '2 de 5' },
    ],
    links: { repo: 'https://github.com/brayangomez22/cuadra-app' },
    cover: cover(
      'M-007',
      'Esquemático de Cuadra: núcleo hexagonal de módulos rodeado por un anillo de tenants aislados',
    ),
    featured: true,
  },
  {
    id: 'payments-mcp',
    code: 'M-008',
    title: 'payments-mcp · Pagos para agentes de IA',
    summary:
      'Middleware de pagos que expone la misma lógica por REST y por un servidor MCP, con OAuth2 según la spec MCP, tools filtradas por scope y reembolso en dos pasos. Incluye un agente con Claude que pide aprobación humana.',
    description:
      'Middleware de pagos que expone la misma lógica de negocio a dos tipos de clientes: servicios internos por una API REST documentada con OpenAPI y agentes de IA por un servidor MCP. Autorización OAuth2 (client credentials, JWT ES256 + JWKS) según la spec MCP, tools filtradas por scope y reembolso en dos pasos (vista previa → confirmación). Idempotencia compartida entre REST y MCP, bloqueos FOR UPDATE contra reembolsos concurrentes y outbox transaccional hacia SQS con entrega at-least-once. Construido con Spec Driven Development: requisitos, diseño y tareas antes del código.',
    status: 'completed',
    role: 'Desarrollador único · proyecto propio',
    durationLabel: '1 semana',
    period: { start: '2026-10-01', end: '2026-10-01' },
    technologies: ['typescript', 'postgresql', 'mcp', 'terraform', 'observability'],
    highlights: [
      'Agente demo con Claude (Anthropic SDK) que descubre las tools por MCP y pide aprobación humana antes de reembolsar.',
      'Un reintento nunca cobra dos veces: la Idempotency-Key se comparte entre REST y MCP.',
      'Infraestructura como código con Terraform (SQS con DLQ, VPC y EKS) y métricas en Prometheus, Grafana y Loki.',
    ],
    challenges: [
      'Dar a un agente de IA acceso a operaciones con dinero sin darle más permisos de los necesarios.',
      'Evitar reembolsos dobles bajo concurrencia y no perder eventos si la cola falla.',
    ],
    metrics: [
      { label: 'Cobertura de tests', value: '≥85%' },
      { label: 'Clientes (REST y MCP)', value: '2' },
      { label: 'Pasos para reembolsar', value: '2' },
    ],
    links: { repo: 'https://github.com/brayangomez22/payments-mcp' },
    cover: cover(
      'M-008',
      'Esquemático de payments-mcp: núcleo de pagos con dos puertas de entrada, REST y MCP, y una compuerta de confirmación',
    ),
    featured: true,
  },
  {
    id: 'findme',
    code: 'M-009',
    title: 'FindMe · Ubicación en tiempo real',
    summary:
      'App tipo «Buscar» de Apple: backend en Go con WebSockets, PostgreSQL + PostGIS y Redis pub/sub para escalar horizontalmente. JWT con refresh tokens rotativos y detección de robo.',
    description:
      'App web de ubicación en tiempo real entre contactos, al estilo de «Buscar» de Apple: cada usuario comparte su posición con contactos aprobados y la ve en un mapa en vivo. Backend en Go con WebSockets y arquitectura hexagonal, PostgreSQL + PostGIS para los datos geográficos y Redis pub/sub para que varias instancias de la API compartan las actualizaciones. Access token JWT corto y refresh tokens opacos rotativos: si llega un token ya rotado se asume robo y se revocan todas las sesiones. Frontend en React 19 + TypeScript con Mapbox.',
    status: 'completed',
    role: 'Desarrollador único · proyecto propio',
    durationLabel: 'MVP · 2 semanas',
    period: { start: '2026-08-01', end: '2026-09-01' },
    technologies: ['go', 'postgresql', 'redis', 'react', 'typescript'],
    highlights: [
      'Posiciones en vivo por WebSockets, con un hub concurrente probado con el detector de carreras.',
      'Redis pub/sub para escalar la API horizontalmente sin perder actualizaciones entre instancias.',
      'Refresh tokens de 256 bits guardados con hash, rotados en cada uso y con detección de robo.',
    ],
    challenges: [
      'Sincronizar ubicaciones entre varias instancias de la API sin estado compartido en memoria.',
      'Poder revocar sesiones robadas manteniendo tokens de acceso cortos y sin estado.',
    ],
    metrics: [
      { label: 'Tiempo real', value: 'WebSockets' },
      { label: 'Escalado horizontal', value: 'Redis pub/sub' },
    ],
    links: { repo: 'https://github.com/brayangomez22/findme' },
    cover: cover(
      'M-009',
      'Esquemático de FindMe: malla de nodos con un pulso de posición y un bus de mensajes pub/sub',
    ),
    featured: false,
  },
  {
    id: 'bg01-station',
    code: 'M-010',
    title: 'BG-01 · Esta estación',
    summary:
      'Este portafolio: sitio estático prerenderizado en React y un CMS headless en Go (SQLite + Litestream en Fly.io) que publica por evento a GitHub Actions. Construido con Claude Code.',
    description:
      'Este portafolio. El sitio es una SPA en React 19 + TypeScript que se prerenderiza a HTML estático por ruta y se hidrata en el navegador, desplegada en GitHub Pages. El contenido vive en bg01-api, un CMS headless en Go (net/http, sqlc y SQLite replicado con Litestream) desplegado en Fly.io. Al pulsar «Publicar» en el Centro de Control, la API dispara un evento a GitHub Actions que sincroniza el contenido, compila y despliega. Construido con Claude Code. Código: github.com/brayangomez22/bg01-station y github.com/brayangomez22/bg01-api.',
    status: 'completed',
    role: 'Desarrollador único · proyecto propio',
    durationLabel: 'En operación',
    period: { start: '2026-06-01' },
    technologies: ['react', 'typescript', 'go', 'docker', 'claude-code'],
    highlights: [
      'Cada ruta pública se prerenderiza a HTML estático y se hidrata en el cliente, sin servidor.',
      'CMS headless en Go (bg01-api) con SQLite replicado a R2 con Litestream.',
      'Publicación en un clic: repository_dispatch → sincronización del contenido → build → GitHub Pages.',
    ],
    challenges: [
      'Una experiencia inmersiva que no sacrifique accesibilidad, rendimiento ni una lectura clara en 10 segundos.',
      'Mantener el sitio estático y casi gratuito sin renunciar a editar el contenido desde un panel.',
    ],
    metrics: [
      { label: 'Repos', value: '2' },
      { label: 'Publicación desde el panel', value: '1 clic' },
      { label: 'Rutas públicas prerenderizadas', value: '100%' },
    ],
    links: {
      live: 'https://brayangomez.dev',
      repo: 'https://github.com/brayangomez22/bg01-station',
    },
    cover: cover(
      'M-010',
      'Esquemático de BG-01: el CMS emite un evento que recorre build y despliegue hasta las páginas de la estación',
    ),
    featured: false,
  },
];

/** Featured first (M-007, M-008, M-005, M-001, M-002), then the rest. */
const MISSION_ORDER = [
  'cuadra',
  'payments-mcp',
  'go-microservices-reengineering',
  'recurring-payments-system',
  'angular-react-migration',
  'multichannel-bots',
  'findme',
  'bg01-station',
  'rofe-platforms',
  'kimsa-climate-systems',
];
const FEATURED_MISSIONS = new Set(MISSION_ORDER.slice(0, 5));

const NEW_EXPERIENCE: Omit<Experience, 'order'> = {
  id: 'log-2026-independiente',
  period: { start: '2026-05-01', end: 'present' },
  company: 'Desarrollo independiente · Proyectos propios',
  role: 'Full Stack Developer',
  location: 'Remoto',
  summary:
    'Productos propios en Go y TypeScript, desarrollados con agentes de IA bajo un proceso definido y con calidad de producción.',
  responsibilities: [
    'Desarrollo con Claude Code: spec, plan aprobado, tests primero y revisión humana de cada cambio.',
    'Diseño de servicios para agentes de IA con MCP y autorización OAuth2.',
    'Observabilidad, CI con análisis de seguridad e infraestructura como código.',
  ],
  achievements: [
    'Cuadra: SaaS multi-tenant para pymes en desarrollo activo (Go, PostgreSQL con RLS, OpenAPI).',
    'payments-mcp: pagos para agentes de IA con idempotencia, outbox hacia SQS y cobertura ≥ 85 %.',
    'FindMe: ubicación en tiempo real con WebSockets, PostGIS y Redis pub/sub.',
  ],
  technologies: [
    'go',
    'typescript',
    'postgresql',
    'react',
    'mcp',
    'claude-code',
    'docker',
    'terraform',
  ],
  type: 'freelance',
};

const EXPERIENCE_ORDER = [
  'log-2026-independiente',
  'log-2022-hibot-fullstack',
  'log-2021-hibot-junior',
  'log-2021-freelance',
];

const FRONTEND_MIGRATION_RECORD: Omit<ArchiveRecordRow, 'order'> = {
  id: 'migracion-angular-react',
  code: 'REG-006',
  title: 'Migrar de Angular a React sin que el cliente lo notara',
  abstract:
    'Dos desarrolladores, 5 meses y más de 40 módulos reescritos sobre una arquitectura nueva de React, sin detener el producto. La meta: que cada pantalla funcionara y se viera exactamente igual.',
  section: 'ing',
  tags: ['REACT', 'ANGULAR', 'MIGRACIÓN', 'FRONTEND'],
  archivedAt: '2026-10-17',
  readingMinutes: 5,
  refs: ['migracion-java-go-por-endpoint'],
  body: [
    {
      kind: 'p',
      text: 'En Hibot Chat lideré la migración de las aplicaciones estratégicas de Angular a React. Éramos dos desarrolladores, tomó 5 meses y el producto nunca dejó de recibir features: migramos módulo a módulo, más de 40 en total.',
    },
    { kind: 'h', text: 'Módulo a módulo, sobre la arquitectura nueva' },
    {
      kind: 'p',
      text: 'Cada módulo se reescribía directamente sobre la arquitectura nueva de React, en lugar de traducir el código de Angular línea por línea. Así cada módulo migrado nacía con la estructura y las convenciones del destino, y el producto seguía operando mientras el resto esperaba su turno.',
    },
    { kind: 'h', text: 'Dos roles: migrar y revisar' },
    {
      kind: 'p',
      text: 'Además de migrar, me encargaba de revisar las nuevas implementaciones: que cumplieran los requisitos y las buenas prácticas de la arquitectura nueva. En un equipo de dos, esa revisión era lo que mantenía la consistencia entre módulos migrados en momentos distintos. La migración dejó además un sistema de componentes reutilizables compartido entre productos.',
    },
    { kind: 'h', text: 'Lo difícil: que nadie notara el cambio' },
    {
      kind: 'p',
      text: 'El objetivo era que el cliente no percibiera un cambio drástico: cada módulo en React tenía que funcionar igual y verse igual que su versión en Angular. Esa doble paridad, funcional y visual, fue lo más exigente. Una migración bien hecha es invisible para quien usa el producto.',
    },
    { kind: 'h', text: 'Cómo medimos el resultado' },
    {
      kind: 'p',
      text: 'El bundle inicial lo comparamos en la salida del build, antes y después: bajó un 38 %. El rendimiento lo medimos con el tiempo de carga de las mismas pantallas en ambas versiones: alrededor de un 40 % más rápido.',
    },
    { kind: 'h', text: 'Lecciones' },
    {
      kind: 'list',
      items: [
        'Reescribir sobre la arquitectura destino, no traducir: un módulo migrado debe parecer nativo del nuevo stack.',
        'La paridad visual importa tanto como la funcional cuando el usuario no pidió el cambio.',
        'En un equipo pequeño, revisar cada implementación nueva evita que la arquitectura se degrade a mitad de camino.',
        'Migrar por módulos permite seguir entregando features mientras la migración avanza.',
      ],
    },
  ],
};

const MIGRATION_RECORD: Omit<ArchiveRecordRow, 'order'> = {
  id: 'migracion-java-go-por-endpoint',
  code: 'REG-005',
  title: 'Migrar de Java a Go endpoint por endpoint, sin apagar nada',
  abstract:
    'Tres desarrolladores, cuatro meses y más de 8 microservicios de Spring Boot a Go, con ambos stacks en producción hasta el final. Lo difícil no fue escribir Go: fue entender el código que había que replicar.',
  section: 'ing',
  tags: ['GO', 'JAVA', 'MIGRACIÓN', 'ARQUITECTURA'],
  archivedAt: '2026-10-17',
  readingMinutes: 5,
  refs: ['idempotencia-en-pagos'],
  body: [
    {
      kind: 'p',
      text: 'En Hibot Chat migramos más de 8 microservicios legacy de Java (Spring Boot) a Go con arquitectura limpia. Éramos tres desarrolladores, tardamos cuatro meses y en ningún momento apagamos el servicio: Java y Go convivieron en producción hasta el último endpoint.',
    },
    { kind: 'h', text: 'Por qué endpoint por endpoint' },
    {
      kind: 'p',
      text: 'Migrar un servicio completo de una vez obliga a validar todo su comportamiento en un solo salto. Migrar endpoint por endpoint reduce cada cambio a una superficie pequeña: un contrato de entrada, un contrato de salida y la lógica entre ambos. Si algo fallaba, el alcance del problema era un endpoint, no un servicio entero.',
    },
    {
      kind: 'list',
      items: [
        'Entender la implementación en Java: qué validaba, qué casos borde cubría y qué esperaban sus consumidores.',
        'Reescribirla en Go con arquitectura limpia, respetando exactamente el mismo contrato.',
        'Ponerla en producción mientras el resto del servicio seguía en Java.',
        'Medir y pasar al siguiente endpoint.',
      ],
    },
    { kind: 'h', text: 'Lo difícil no fue escribir Go' },
    {
      kind: 'p',
      text: 'La parte más costosa fue el análisis: entender cómo funcionaba el código existente para migrar la lógica tal cual, sin romper nada. Una migración no es el momento de corregir reglas de negocio de las que dependen otros sistemas; cualquier cambio de comportamiento, por bien intencionado que sea, es un bug para quien consume la API.',
    },
    { kind: 'h', text: 'Cómo medimos la mejora' },
    {
      kind: 'p',
      text: 'Comparamos la latencia media de las APIs críticas antes y después de migrarlas, con las métricas que ya teníamos en Prometheus y Grafana. El resultado fue una reducción de alrededor del 35 %: de 800 ms a 520 ms en promedio.',
    },
    { kind: 'h', text: 'Lecciones' },
    {
      kind: 'list',
      items: [
        'Migrar por endpoint convierte una reescritura grande en muchos cambios pequeños y reversibles.',
        'El análisis del código existente es la mayor parte del trabajo; escribir el código nuevo es lo rápido.',
        '«Tal cual» es un requisito, no una sugerencia: la migración y los cambios de negocio van por separado.',
        'Sin una línea base medida antes de empezar, no hay forma de demostrar la mejora.',
      ],
    },
  ],
};

const NEW_ARCHIVE_RECORD: Omit<ArchiveRecordRow, 'order'> = {
  id: 'desarrollo-con-agentes-claude-code',
  code: 'REG-004',
  title: 'Desarrollar con un agente sin perder el control: mi flujo con Claude Code',
  abstract:
    'Cuadra lleva 8 días, 39 PRs integrados y 161 decisiones registradas, desarrollado con Claude Code. Lo que lo hace funcionar no es el modelo: es un flujo que el agente no puede saltarse.',
  section: 'ing',
  tags: ['IA', 'CLAUDE CODE', 'PROCESO', 'TESTING'],
  archivedAt: '2026-10-16',
  readingMinutes: 7,
  refs: [],
  body: [
    {
      kind: 'p',
      text: 'Cuadra es un SaaS multi-tenant que maneja dinero, inventario y datos de muchos comercios en una misma base de datos. Es el tipo de sistema donde un error no aparece en la demo: aparece en el cierre de caja de un cliente. Lo desarrollo solo, con Claude Code, y la pregunta nunca fue si el agente escribe buen código —muchas veces lo hace—, sino cómo garantizar que cada cambio sea revisable, probado y dentro del alcance cuando buena parte del código lo propone un agente.',
    },
    { kind: 'h', text: 'El problema no es el código, es el alcance' },
    {
      kind: 'p',
      text: 'Un agente sin límites tiende a hacer de más: arregla algo que vio de paso, agrega una dependencia «útil», refactoriza el módulo vecino. Cada cosa por separado es razonable; juntas producen PRs imposibles de revisar. La solución fue convertir el proceso en algo que el agente ejecuta, no en algo que yo tengo que recordar.',
    },
    { kind: 'h', text: 'Las reglas viven en el repositorio' },
    {
      kind: 'p',
      text: 'CLAUDE.md es el contrato. No es documentación para humanos: son las instrucciones que el agente carga en cada sesión. Arquitectura hexagonal por módulo, cómo se aísla cada tenant, float prohibido para dinero, API contract-first con OpenAPI y qué puede ir en un span y qué no. Las reglas críticas son verificables:',
    },
    {
      kind: 'code',
      lang: 'markdown',
      code: '## Multi-tenant (crítico)\n- Toda operación de BD de negocio corre dentro de `platform/db.WithTenantTx(ctx, fn)`.\n- El `tenant_id` sale solo del token autenticado (contexto), nunca del body o de la URL.\n- Cada repositorio nuevo lleva un test de aislamiento: los datos del tenant A\n  no se ven ni se modifican desde el tenant B.',
    },
    { kind: 'h', text: '/tarea: rama → plan → tests en rojo → implementación' },
    {
      kind: 'p',
      text: 'El flujo es un comando propio. /tarea T23 crea la rama desde main actualizada, lee el plan de la fase y los pendientes que le tocan, y presenta un plan corto. Ahí se detiene: nada se escribe hasta que yo lo apruebo.',
    },
    {
      kind: 'list',
      items: [
        'Rama: una por tarea. Si hay cambios sin commit en otra, se detiene y avisa.',
        'Plan: archivos, cambios al contrato OpenAPI, nombres de los tests en español, spans y métricas, preguntas abiertas. Espera aprobación.',
        'Tests en rojo: escribe solo los tests y muestra que fallan por la razón esperada.',
        'Implementación: lo mínimo para que pasen; después, refactor.',
        'Verificación: make check en verde. Nunca se salta ni se desactiva un test.',
      ],
    },
    {
      kind: 'p',
      text: 'El paso que más valor aporta es el tercero. Ver el test fallar por la razón correcta es la prueba de que mide algo; un test escrito después de la implementación tiende a confirmar lo que el código ya hace.',
    },
    { kind: 'h', text: 'Lo que queda fuera no se pierde' },
    {
      kind: 'p',
      text: 'Regla: si el agente ve algo que mejorar fuera del alcance, lo anota; no lo hace. Esas notas van a docs/plan/pendientes.md con su origen y su destino, la tarea posterior que lo cubre. Al empezar una tarea, /tarea lee los pendientes que le corresponden y los mete en el plan. Hoy hay unos 40 registrados, desde el rate limit del registro hasta los paneles de Grafana de la caja.',
    },
    { kind: 'h', text: 'Cerrar es un permiso, no un hábito' },
    {
      kind: 'p',
      text: 'El agente no hace commits, push ni PRs por su cuenta. /cerrar-tarea es la autorización explícita y viene con herramientas acotadas: commit, push, abrir el PR y esperar el CI. El merge solo ocurre con squash y con todos los checks en verde. Nunca push directo a main, nunca --force, nunca --admin.',
    },
    {
      kind: 'p',
      text: 'Cada PR trae una sección fija, «Revisar con lupa», que señala dónde están el dinero, el stock, los permisos, el tenant y los datos sensibles de ese cambio. En la tarea de la caja (T23) apuntaba a la cuenta del esperado en el arqueo, a las ventas anuladas antes y después del cierre, a quién puede cerrar una caja y a que los logs lleven solo IDs, nunca montos. Mi revisión empieza ahí.',
    },
    { kind: 'h', text: 'Los números' },
    {
      kind: 'list',
      items: [
        '8 días desde el primer commit (del 9 al 16 de octubre de 2026).',
        '42 PRs abiertos, 39 integrados.',
        '161 decisiones registradas con fecha y motivo en docs/decisiones.md.',
        '110+ archivos de tests entre Go y el frontend.',
      ],
    },
    { kind: 'h', text: 'Lecciones' },
    {
      kind: 'list',
      items: [
        'El proceso tiene que vivir en el repo y ser ejecutable: un comando que el agente sigue vale más que una buena intención.',
        'Detenerse a pedir aprobación es una funcionalidad: el plan es el punto más barato para corregir el rumbo.',
        'Tests en rojo primero: es la única forma de saber que el test prueba algo.',
        'Lo que depende de disciplina se rompe con un agente. Prefiero lo que impone la herramienta: RLS en la base de datos, CSS Modules en lugar de BEM.',
        'La revisión humana no desaparece, se enfoca: el PR me dice dónde mirar con lupa.',
      ],
    },
  ],
};

/** Real captures of each product (1440×900 WebP in public/gallery/). */
// REG-010: draft in docs/borrador-reg-010-bots-multicanal.md, built only from
// what the M-003 briefing states (no invented incidents or figures).
const MULTICHANNEL_RECORD: Omit<ArchiveRecordRow, 'order'> = {
  id: 'bots-multicanal-hexagonal',
  code: 'REG-010',
  title: 'Cuatro canales, un núcleo: bots multicanal con arquitectura hexagonal',
  abstract:
    'WhatsApp, Facebook, Instagram y Telegram hablan idiomas distintos. Cómo se organiza un backend en Go para que el núcleo de ruteo no sepa de ninguno, y por qué la arquitectura hexagonal encaja tan bien en este problema.',
  section: 'ing',
  tags: ['GO', 'ARQUITECTURA', 'MONGODB'],
  archivedAt: '2026-10-18',
  readingMinutes: 7,
  refs: ['migracion-java-go-por-endpoint', 'goroutines-que-no-mueren'],
  body: [
    {
      kind: 'p',
      text: 'En Hibot Chat participé en la red de bots e integraciones que conecta cuatro canales de mensajería (WhatsApp, Facebook, Instagram y Telegram) con el núcleo de la plataforma. El sistema mueve más de 5.000 conversaciones al día y opera 24/7. Este registro explica cómo se estructura un backend así y por qué la arquitectura hexagonal es la que mejor le sienta.',
    },
    { kind: 'h', text: 'Cuatro APIs, cuatro idiomas' },
    {
      kind: 'p',
      text: 'Cada plataforma tiene su forma de entregar un mensaje: webhooks con formatos distintos, identificadores de usuario con reglas propias, adjuntos que llegan como URL en una y como referencia a descargar en otra, botones y plantillas que solo existen en algunas. Si esa diversidad llega al código que decide qué hacer con cada conversación, cada regla de negocio termina llena de condiciones por canal, y añadir uno nuevo obliga a tocarlo todo.',
    },
    { kind: 'h', text: 'El núcleo no conoce los canales' },
    {
      kind: 'p',
      text: 'En una arquitectura hexagonal el núcleo define lo que necesita mediante interfaces (los puertos) y cada tecnología externa se conecta por un adaptador. Aquí el núcleo de ruteo solo entiende un mensaje normalizado y una forma de responder. No importa el SDK de ninguna plataforma.',
    },
    {
      kind: 'code',
      lang: 'go',
      code: '// Ilustrativo: el puerto de salida que el núcleo usa para responder.\n// El núcleo no sabe si detrás hay WhatsApp o Telegram.\ntype Channel interface {\n    Send(ctx context.Context, to Recipient, msg Outgoing) error\n}\n\n// El mensaje que entra al núcleo, ya traducido por el adaptador del canal.\ntype Incoming struct {\n    Channel        ChannelID // whatsapp, facebook, instagram, telegram\n    ConversationID string\n    From           Recipient\n    Text           string\n    Attachments    []Attachment\n    ReceivedAt     time.Time\n}',
    },
    {
      kind: 'p',
      text: 'Cada canal tiene su adaptador de entrada, que recibe el webhook y lo traduce a Incoming, y su adaptador de salida, que implementa Channel con la API de esa plataforma. El núcleo recibe sus dependencias al arrancar y nunca importa un paquete de un canal concreto.',
    },
    { kind: 'h', text: 'Normalizar sin perder información' },
    {
      kind: 'p',
      text: 'Normalizar no es quedarse con el mínimo común. Lo que todos los canales comparten (texto, remitente, conversación, adjuntos) va en campos tipados. Lo que es propio de una plataforma se queda en el adaptador, que sabe cómo representarlo al responder. Así el núcleo trabaja con un modelo estable y cada canal conserva lo que lo hace distinto.',
    },
    {
      kind: 'p',
      text: 'La ventaja se ve en las pruebas: las reglas de ruteo se prueban con mensajes normalizados y un Channel falso, sin levantar ninguna integración real.',
    },
    { kind: 'h', text: 'Cuando el canal no responde' },
    {
      kind: 'p',
      text: 'Cada plataforma impone límites de uso y, de vez en cuando, falla. En un diseño hexagonal esa responsabilidad vive en el adaptador, que es quien conoce las reglas de su canal: cuántas peticiones admite, qué errores son temporales y cuáles no. El núcleo pide enviar un mensaje; el adaptador decide cómo entregarlo sin saturar la plataforma, y la caída de un canal no arrastra a los otros tres.',
    },
    { kind: 'h', text: 'Métricas de conversación' },
    {
      kind: 'p',
      text: 'Con las conversaciones guardadas en MongoDB, las métricas salen de pipelines de agregación en la propia base: volumen por canal, conversaciones por día, tiempos de respuesta. Calcularlas en la base, en vez de traer los documentos a la aplicación, mantiene el cálculo cerca de los datos.',
    },
    {
      kind: 'code',
      lang: 'js',
      code: "// Ilustrativo: conversaciones por canal y por día.\ndb.messages.aggregate([\n  { $match: { receivedAt: { $gte: ISODate('2022-01-01') } } },\n  { $group: {\n      _id: { channel: '$channel', day: { $dateTrunc: { date: '$receivedAt', unit: 'day' } } },\n      conversations: { $addToSet: '$conversationId' },\n  } },\n  { $project: { conversations: { $size: '$conversations' } } },\n  { $sort: { '_id.day': 1 } },\n]);",
    },
    { kind: 'h', text: 'Lecciones' },
    {
      kind: 'list',
      items: [
        'Cuando varias integraciones hacen lo mismo de formas distintas, la diferencia debe quedarse en el borde del sistema, no en la lógica de negocio.',
        'Un modelo de mensaje normalizado hace que añadir un canal sea escribir un adaptador, no reescribir el núcleo.',
        'Los límites de uso y las caídas son reglas de cada canal: viven en su adaptador.',
        'Las reglas de ruteo se prueban sin integraciones reales si el núcleo solo depende de interfaces.',
      ],
    },
  ],
};

// REG-007…009: drafts in docs/borradores-archivo-2026-10.md, from the code of
// payments-mcp, Cuadra and FindMe.
const MCP_OAUTH_RECORD: Omit<ArchiveRecordRow, 'order'> = {
  id: 'oauth-para-agentes-mcp',
  code: 'REG-007',
  title: 'OAuth para agentes: darle a un modelo acceso a pagos sin darle las llaves',
  abstract:
    'Un agente de IA que puede cobrar y reembolsar necesita algo más que un token. Cómo resolví en payments-mcp qué ve el modelo, para quién actúa y cuándo hace falta permiso humano.',
  section: 'ing',
  tags: ['MCP', 'IA', 'SEGURIDAD'],
  archivedAt: '2026-10-17',
  readingMinutes: 9,
  refs: ['idempotencia-en-pagos', 'desarrollo-con-agentes-claude-code'],
  body: [
    {
      kind: 'p',
      text: 'En payments-mcp la misma lógica de pagos se ofrece a dos tipos de clientes: los servicios internos, por una API REST, y los agentes de IA, por un servidor MCP. La parte REST es terreno conocido: OAuth2 con client credentials, un JWT firmado y scopes por ruta. Con un agente la pregunta cambia. El cliente es un modelo que lee texto de terceros (la nota de un pedido, un correo, la descripción de un producto) y cualquiera de esos textos puede intentar darle instrucciones. La seguridad no puede depender de que el modelo se porte bien.',
    },
    { kind: 'h', text: 'Cómo encuentra el agente a quién pedir el token' },
    {
      kind: 'p',
      text: 'La especificación de MCP delega la autorización en OAuth. Si alguien llama a POST /mcp sin un token válido, el servidor responde 401 con una cabecera WWW-Authenticate que apunta a su Protected Resource Metadata (RFC 9728): un JSON que dice qué recurso es, quién emite sus tokens y qué scopes existen. El cliente lo lee, va al servidor de autorización y pide el token por su cuenta. El agente no lleva URLs de autenticación configuradas a mano.',
    },
    {
      kind: 'code',
      lang: 'json',
      code: '{\n  "resource": "https://payments.example.com/mcp",\n  "authorization_servers": ["https://payments.example.com"],\n  "scopes_supported": ["payments:read", "payments:write", "payments:refund"],\n  "bearer_methods_supported": ["header"]\n}',
    },
    { kind: 'h', text: 'Un token, un recurso' },
    {
      kind: 'p',
      text: 'El cliente pide el token indicando para qué recurso lo quiere (resource, RFC 8707) y ese valor termina en el claim aud. La API REST solo acepta tokens con su propia audiencia y el endpoint MCP solo los suyos. Un token emitido para el agente no sirve contra la API REST, y al revés tampoco.',
    },
    {
      kind: 'p',
      text: 'Parece un detalle, pero evita el *token passthrough*: un servidor MCP que reenvía a otra API el token que recibió se convierte en un intermediario con más poder del que debería (el problema del *confused deputy*). La verificación también fija el algoritmo (ES256) en vez de confiar en la cabecera del propio token, que es la puerta clásica de los ataques con alg: none.',
    },
    { kind: 'h', text: 'Lo que el modelo no ve, no lo puede llamar' },
    {
      kind: 'p',
      text: 'El endpoint MCP no guarda estado: cada petición construye un servidor nuevo a partir del token verificado, así que cualquier pod puede atenderla sin sesiones pegajosas. Al construirlo, cada tool se registra solo si el token trae su scope.',
    },
    {
      kind: 'code',
      lang: 'ts',
      code: "const can = (scope: Scope): boolean => auth.scopes.has(scope);\n\nif (can('payments:read')) registerReadTools(server, deps);\nif (can('payments:write')) registerCreatePayment(server, deps);\nif (can('payments:refund')) registerRefundPayment(server, deps);",
    },
    {
      kind: 'p',
      text: 'El agente de la tienda A tiene read y write, pero no refund, así que refund_payment ni siquiera aparece en tools/list. Un prompt malicioso no puede convencer al modelo de usar una herramienta que no existe para él.',
    },
    {
      kind: 'p',
      text: 'La segunda decisión va en la misma línea: ninguna tool recibe el comercio como argumento. El merchantId sale del token y las tools lo capturan al crearse. Si un texto inyectado le pide al modelo «consulta los pagos del comercio B», no hay ningún parámetro que manipular.',
    },
    { kind: 'h', text: 'Mover dinero con dos llaves' },
    {
      kind: 'p',
      text: 'Un reembolso no se puede deshacer, así que refund_payment funciona en dos pasos. Sin confirm: true devuelve una vista previa: aplica las mismas validaciones que el reembolso real, no tiene ningún efecto y le indica al modelo que pida aprobación. Solo una segunda llamada con los mismos argumentos y confirm: true mueve el dinero.',
    },
    {
      kind: 'p',
      text: 'El agente de demostración añade un segundo candado en el cliente: antes de ejecutar una tool marcada como destructiva con confirm: true, le pregunta a la persona. Si no hay forma de preguntar, la rechaza por defecto. El servidor no confía en el cliente y el cliente no confía en el modelo.',
    },
    {
      kind: 'p',
      text: 'Las descripciones de las tools también son parte del contrato, porque el modelo las lee. create_payment exige una idempotencyKey y explica qué hacer ante un timeout: reintentar con la misma clave y, si el pago queda pending, consultarlo más tarde en vez de cobrar otra vez con una clave nueva.',
    },
    { kind: 'h', text: 'Lecciones' },
    {
      kind: 'list',
      items: [
        'La autorización la impone el servidor. Las instrucciones al modelo ayudan, pero no protegen.',
        'Un token por recurso (aud): un token nunca debe servir donde no se pidió.',
        'Filtrar las tools por scope reduce la superficie de ataque: el modelo solo ve lo que puede hacer.',
        'La identidad (para qué comercio se actúa) sale del token, nunca de un argumento que el modelo pueda elegir.',
        'Para lo irreversible: vista previa, confirmación explícita y aprobación humana.',
      ],
    },
  ],
};

const RLS_RECORD: Omit<ArchiveRecordRow, 'order'> = {
  id: 'multi-tenant-con-rls',
  code: 'REG-008',
  title: 'Multi-tenant con Row-Level Security: que la base no confíe en mi código',
  abstract:
    'En Cuadra todos los comercios comparten una base de datos. Cómo hago que PostgreSQL impida ver datos de otro cliente aunque el código tenga un bug, y tres trampas que encontré por el camino.',
  section: 'ing',
  tags: ['POSTGRESQL', 'MULTI-TENANT', 'SEGURIDAD'],
  archivedAt: '2026-10-17',
  readingMinutes: 9,
  refs: ['rotacion-de-refresh-tokens', 'idempotencia-en-pagos'],
  body: [
    {
      kind: 'p',
      text: 'Cuadra es un SaaS de gestión para pymes colombianas (punto de venta, inventario y caja) en Go y PostgreSQL. Todos los comercios viven en la misma base y cada tabla de negocio lleva una columna tenant_id. La forma barata de aislarlos es añadir WHERE tenant_id = $1 a cada consulta. El problema es que basta con olvidarlo una vez para que una ferretería vea las ventas de otra. Quería que esa garantía la diera la base de datos, no mi disciplina.',
    },
    { kind: 'h', text: 'La política' },
    {
      kind: 'p',
      text: 'Cada tabla de negocio tiene Row-Level Security activado y forzado, con una política que compara contra el tenant de la transacción en curso:',
    },
    {
      kind: 'code',
      lang: 'sql',
      code: "CREATE FUNCTION current_tenant_id() RETURNS uuid LANGUAGE sql STABLE AS\n$$ SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid $$;\n\nALTER TABLE products ENABLE ROW LEVEL SECURITY;\nALTER TABLE products FORCE ROW LEVEL SECURITY;\n\nCREATE POLICY tenant_isolation ON products\n    USING (tenant_id = current_tenant_id())\n    WITH CHECK (tenant_id = current_tenant_id());",
    },
    {
      kind: 'p',
      text: 'Falla cerrada: si no hay tenant, la consulta no ve ni escribe ninguna fila. No lanza error, pero tampoco filtra nada. WITH CHECK impide insertar filas a nombre de otro tenant o moverlas con un UPDATE.',
    },
    { kind: 'h', text: 'El tenant viaja con la transacción' },
    {
      kind: 'p',
      text: 'El código de negocio solo llega a la base a través de un helper que abre una transacción y fija el tenant:',
    },
    {
      kind: 'code',
      lang: 'go',
      code: 'return d.WithTx(ctx, func(tx pgx.Tx) error {\n    _, err := tx.Exec(ctx, "SELECT set_config(\'app.tenant_id\', $1, true)", tenantID.String())\n    if err != nil {\n        return fmt.Errorf("db: set tenant: %w", err)\n    }\n    return fn(tx)\n})',
    },
    {
      kind: 'p',
      text: 'El true del final es lo importante: hace que el ajuste sea local a la transacción. Con un pool de conexiones, un SET de sesión se quedaría pegado a la conexión y lo heredaría la siguiente petición, de otro comercio.',
    },
    { kind: 'h', text: 'Trampa 1: el rol que se salta todo' },
    {
      kind: 'p',
      text: 'RLS no aplica a los superusuarios, a los roles con BYPASSRLS ni al dueño de la tabla. Un error de configuración, como conectar la API con el usuario que corre las migraciones, haría desaparecer el aislamiento sin que nada fallara.',
    },
    {
      kind: 'p',
      text: 'Por eso la API comprueba su propio rol al arrancar y se niega a iniciar si podría saltarse RLS. Las migraciones corren con otro rol, dueño del esquema, y el rol de la aplicación solo tiene SELECT, INSERT, UPDATE y DELETE. Tampoco tiene TRUNCATE, que ignora las políticas.',
    },
    { kind: 'h', text: 'Trampa 2: las claves foráneas no ven RLS' },
    {
      kind: 'p',
      text: 'PostgreSQL comprueba las claves foráneas sin aplicar las políticas. Con una FK simple, un producto del tenant A podría apuntar a una categoría del tenant B y la base lo aceptaría. La solución es que la FK incluya el tenant:',
    },
    {
      kind: 'code',
      lang: 'sql',
      code: 'ALTER TABLE products\n    ADD FOREIGN KEY (tenant_id, category_id) REFERENCES categories (tenant_id, id);',
    },
    { kind: 'h', text: 'Trampa 3: el índice que nunca se usó' },
    {
      kind: 'p',
      text: 'La búsqueda de productos tenía un índice trigram para acelerar los LIKE. Al medir, resultó que nunca se usaba. Con RLS forzado, PostgreSQL no evalúa antes de la política un operador que no esté marcado como LEAKPROOF, porque podría filtrar datos de filas que el usuario no debe ver. LIKE no lo es.',
    },
    {
      kind: 'p',
      text: 'Con 20.000 productos, la búsqueda tardaba 2,1 ms sin RLS y 7,2 ms con RLS, recorriendo los productos del tenant por el índice de tenant_id. Marcar el operador como LEAKPROOF exige ser superusuario, que en Azure no está disponible, y una función SECURITY DEFINER abriría justo el tipo de puerta entre tenants que RLS cierra. Quité el índice y acepté el costo: crece con el catálogo de un solo comercio, no con la tabla entera. Lo vuelvo a medir con pruebas de carga antes de crecer.',
    },
    { kind: 'h', text: 'Lecciones' },
    {
      kind: 'list',
      items: [
        'Si el aislamiento depende de no olvidar un WHERE, tarde o temprano se rompe. Que lo imponga la base.',
        'set_config(..., true): con un pool, el tenant tiene que vivir en la transacción, no en la conexión.',
        'El código debe comprobar que su rol no puede saltarse RLS; una revisión manual no basta.',
        'Las FK no pasan por RLS: inclúyeles el tenant_id.',
        'RLS tiene costo en el planificador. Hay que medirlo con datos reales, no suponerlo.',
      ],
    },
  ],
};

const REFRESH_TOKENS_RECORD: Omit<ArchiveRecordRow, 'order'> = {
  id: 'rotacion-de-refresh-tokens',
  code: 'REG-009',
  title: 'Refresh tokens que delatan al ladrón',
  abstract:
    'Un refresh token robado da semanas de acceso. Rotarlo en cada uso permite detectar cuando dos personas usan el mismo. Lo difícil es no cerrarle la sesión a un usuario legítimo con dos peticiones en paralelo.',
  section: 'ing',
  tags: ['SEGURIDAD', 'AUTH', 'GO'],
  archivedAt: '2026-10-17',
  readingMinutes: 8,
  refs: ['multi-tenant-con-rls', 'oauth-para-agentes-mcp'],
  body: [
    {
      kind: 'p',
      text: 'En FindMe (ubicación en tiempo real) la sesión tiene dos piezas: un access token corto que vive en memoria y un refresh token que vive en una cookie HttpOnly, fuera del alcance del JavaScript. El access token caduca en minutos; el refresh token dura semanas. Si alguien lo roba, tiene acceso todo ese tiempo, salvo que el servidor pueda notarlo.',
    },
    { kind: 'h', text: 'Opaco, no JWT' },
    {
      kind: 'p',
      text: 'El refresh token no es un JWT. Un JWT es válido hasta que expira y no se puede revocar antes sin añadir una lista de bloqueo. Este es un valor aleatorio de 256 bits y en la base solo se guarda su hash:',
    },
    {
      kind: 'code',
      lang: 'go',
      code: '// SHA-256 y no bcrypt: el token ya es aleatorio de 256 bits, no hace falta\n// un hash lento y sí una búsqueda por índice.\nfunc hashRefreshToken(plain string) []byte {\n    sum := sha256.Sum256([]byte(plain))\n    return sum[:]\n}',
    },
    { kind: 'p', text: 'Si se filtra la tabla, los hashes no sirven para nada.' },
    { kind: 'h', text: 'Rotar para detectar' },
    {
      kind: 'p',
      text: 'Cada vez que el cliente renueva la sesión, el servidor revoca el refresh token que recibió y emite otro. En uso normal, cada token se presenta una sola vez. Si llega uno que ya fue rotado, alguien tiene una copia vieja: o el atacante o la víctima. El servidor no puede saber quién es quién, así que revoca todas las sesiones de ese usuario. Los dos tienen que volver a entrar, y solo uno conoce la contraseña.',
    },
    { kind: 'h', text: 'La carrera' },
    {
      kind: 'p',
      text: 'Hay un detalle fácil de pasar por alto. Si la comprobación y la revocación son dos pasos (leer el token, ver que no esté revocado y marcarlo como revocado), queda una ventana: dos peticiones simultáneas con el mismo token pasan la comprobación antes de que cualquiera de las dos lo revoque, y las dos reciben un token nuevo. La detección fallaría justo cuando importa: cuando un atacante y la víctima renuevan a la vez.',
    },
    {
      kind: 'p',
      text: 'En Cuadra la rotación es atómica. El UPDATE que revoca es condicional y va en la misma transacción que crea el sucesor. Si no afectó ninguna fila, otro ya lo había rotado:',
    },
    {
      kind: 'code',
      lang: 'go',
      code: 'affected, err := q.RevokeRefreshToken(ctx, params) // ... WHERE id = $2 AND revoked_at IS NULL\nif err != nil {\n    return err\n}\nif affected == 0 {\n    return domain.ErrRefreshTokenReused\n}\nreturn createToken(ctx, q, next)',
    },
    {
      kind: 'p',
      text: 'Cuadra además agrupa los tokens en familias. Una reutilización revoca solo la familia de esa sesión, no las del resto de dispositivos del usuario, y se cuenta en una métrica para ver si alguna vez pasa de verdad.',
    },
    { kind: 'h', text: 'El falso positivo que más duele' },
    {
      kind: 'p',
      text: 'Con detección de reutilización, el peor enemigo es tu propio frontend. Si dos peticiones encuentran el access token caducado a la vez y cada una pide su renovación, la segunda presenta un token que la primera acaba de rotar. El servidor lo interpreta como robo y cierra la sesión sin que nadie haya hecho nada malo. En desarrollo, el doble montaje de StrictMode en React lo provoca siempre.',
    },
    {
      kind: 'p',
      text: 'En el cliente de FindMe hay una sola renovación en curso, compartida por todas las peticiones. Si otra petición ya renovó, la que reintenta usa el token nuevo en vez de pedir otro. La renovación se adelanta un minuto al vencimiento, porque el WebSocket se autentica al conectar y una reconexión necesita un token vivo. Y un fallo de red no cierra la sesión: solo lo hace un 401.',
    },
    { kind: 'h', text: 'Lecciones' },
    {
      kind: 'list',
      items: [
        'Refresh tokens opacos y hasheados: se pueden revocar y no sirven si se filtra la base.',
        'La rotación convierte la reutilización en una señal de robo.',
        'La comprobación y la revocación tienen que ser una sola operación atómica, o la detección tiene un hueco.',
        'Antes de activar la detección, asegúrate de que tu cliente nunca renueva dos veces en paralelo.',
      ],
    },
  ],
};

const shot = (mission: string, file: string, alt: string): MediaRef => ({
  src: `/gallery/${mission}/${file}.webp`,
  alt,
  width: 1440,
  height: 900,
});

const GALLERIES: Record<string, MediaRef[]> = {
  cuadra: [
    shot(
      'm-007',
      '01-pos',
      'Punto de venta de un comercio de demostración: productos escaneados por código de barras, cable vendido por metros (12,5 m), IVA desglosado y total',
    ),
    shot(
      'm-007',
      '02-cobro',
      'Cobro con pago mixto en efectivo y tarjeta, con lo recibido y el cambio calculados en vivo',
    ),
    shot(
      'm-007',
      '03-cierre',
      'Cierre de caja con arqueo ciego: esperado contra contado, faltante y reporte imprimible en formato de tirilla',
    ),
    shot(
      'm-007',
      '04-inventario',
      'Inventario por sede con existencias en la unidad de cada producto y costo promedio',
    ),
  ],
  'payments-mcp': [
    shot(
      'm-008',
      '01-mcp',
      'Sesión MCP real: el agente no recibe la tool refund_payment por falta de scope, y el reembolso exige vista previa y confirmación',
    ),
    shot(
      'm-008',
      '02-grafana',
      'Dashboard de Grafana con tráfico de prueba: requests por ruta y estado, latencias p95/p99, pagos por estado y tools MCP',
    ),
    shot(
      'm-008',
      '03-swagger',
      'API REST documentada con OpenAPI: las mismas operaciones que expone el servidor MCP',
    ),
  ],
  findme: [
    shot('m-009', '01-inicio', 'Pantalla de inicio de FindMe'),
    shot(
      'm-009',
      '02-mapa',
      'Mapa en vivo sobre Medellín con tres contactos de demostración compartiendo su ubicación por WebSockets',
    ),
    shot(
      'm-009',
      '03-movil',
      'Vista móvil: tu posición en El Poblado y tus contactos en el mapa',
    ),
  ],
  // No public code or screens (former employer): an illustrative schematic.
  'recurring-payments-system': [
    {
      src: '/gallery/m-001/01-flujo-de-cobro.svg',
      alt: 'Esquemático ilustrativo del flujo de un cobro recurrente: motor en Go, capa de idempotencia que hace seguro el reintento, pasarelas de terceros y conciliación de estados',
      width: 1440,
      height: 900,
    },
  ],
  'angular-react-migration': [
    {
      src: '/gallery/m-002/01-migracion.svg',
      alt: 'Esquemático ilustrativo de la migración módulo a módulo de Angular a React, con ambos conviviendo en el producto y un sistema de componentes reutilizables',
      width: 1440,
      height: 900,
    },
  ],
  'multichannel-bots': [
    {
      src: '/gallery/m-003/01-canales.svg',
      alt: 'Esquemático ilustrativo de la arquitectura hexagonal: WhatsApp, Facebook, Instagram y Telegram como adaptadores que normalizan los mensajes hacia el núcleo de ruteo en Go',
      width: 1440,
      height: 900,
    },
  ],
  'rofe-platforms': [
    {
      src: '/gallery/m-004/01-plataformas.svg',
      alt: 'Esquemático ilustrativo: las plataformas Mujeres ROFÉ y Jóvenes creaTIvos, en Angular, sobre un backend NestJS con MySQL, desplegadas en Microsoft Azure',
      width: 1440,
      height: 900,
    },
  ],
  'kimsa-climate-systems': [
    {
      src: '/gallery/m-006/01-sistemas.svg',
      alt: 'Esquemático ilustrativo: frontends en Angular y React integrados por API REST con un backend NestJS que centraliza la operación administrativa de la consultora',
      width: 1440,
      height: 900,
    },
  ],
  'go-microservices-reengineering': [
    {
      src: '/gallery/m-005/01-migracion.svg',
      alt: 'Esquemático ilustrativo de la migración: servicios Java (Spring Boot) migrados a Go endpoint por endpoint mientras ambos stacks seguían en producción, y latencia media de 800 a 520 ms',
      width: 1440,
      height: 900,
    },
  ],
  'bg01-station': [
    shot('m-010', '01-puente', 'Puente de mando: la portada del portafolio'),
    shot(
      'm-010',
      '02-mapa',
      'Esquemático de la estación: navegación entre las siete cubiertas',
    ),
    shot(
      'm-010',
      '03-sistemas',
      'Sistema orbital: cada tecnología como planeta, con desde cuándo la uso y en qué misiones',
    ),
  ],
};

// ── transform ────────────────────────────────────────────────────────────────

const clone = <T>(v: T): T => structuredClone(v);

function byId<T extends { id: string }>(list: T[], id: string): T {
  const item = list.find((x) => x.id === id);
  if (!item) throw new Error(`No existe "${id}" en el contenido actual.`);
  return item;
}

/** Insert or overwrite a record by id, keeping fields the patch doesn't set. */
function upsert<T extends { id: string }>(list: T[], item: Partial<T> & { id: string }) {
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) list.push(item as T);
  else list[i] = { ...list[i], ...item };
}

const addUnique = (list: string[], ...items: string[]) => [
  ...list,
  ...items.filter((x) => !list.includes(x)),
];

function applyOrder<T extends { id: string; order: number }>(list: T[], ids: string[]) {
  for (const item of list) {
    const pos = ids.indexOf(item.id);
    if (pos === -1) throw new Error(`"${item.id}" no está en el orden previsto.`);
    item.order = pos + 1;
  }
  list.sort((a, b) => a.order - b.order);
}

function setStat(stats: LabelledValue[], labels: string[], next: LabelledValue) {
  const stat = stats.find((s) => labels.includes(s.label));
  if (!stat) throw new Error(`No existe la cifra "${labels[0]}" del piloto.`);
  Object.assign(stat, next);
}

function target(current: Bundle): Bundle {
  const next = clone(current);

  // Piloto
  next.pilot.role = 'Full Stack Developer Semi Senior · Go & Java';
  next.pilot.bio = BIO;
  setStat(next.pilot.stats, ['Misiones documentadas'], {
    label: 'Misiones documentadas',
    value: '10',
  });
  setStat(next.pilot.stats, ['Sistemas dominados', 'Sistemas en órbita'], {
    label: 'Sistemas en órbita',
    value: '17',
  });

  // Sistemas
  for (const t of next.technologies) delete t.usedInMissions;
  for (const t of NEW_TECHNOLOGIES) upsert(next.technologies, t as Technology);
  byId(next.technologies, 'go').description =
    'Lenguaje principal en backend desde 2021: microservicios, APIs REST, pagos y tiempo real (WebSockets), con arquitectura hexagonal.';
  applyOrder(next.technologies, TECH_ORDER);

  // Misiones
  for (const m of NEW_MISSIONS) upsert(next.missions, m as Mission);

  const m005 = byId(next.missions, 'go-microservices-reengineering');
  m005.title = 'Migración Java → Go y reingeniería de microservicios';
  m005.summary =
    'Lideré la migración de 8+ microservicios legacy de Java (Spring Boot) a Go con arquitectura limpia, manteniendo ambos stacks en producción durante la transición.';
  m005.technologies = addUnique(
    m005.technologies,
    'java',
    'spring-boot',
    'observability',
  );
  m005.metrics = [
    { label: 'Servicios migrados', value: '8+' },
    { label: 'Latencia media (800 → 520 ms)', value: '−35%' },
    { label: 'Downtime en reescrituras', value: '0' },
  ];

  byId(next.missions, 'recurring-payments-system').metrics = [
    { label: 'Cobros/mes', value: '12k+' },
    { label: 'Trabajo manual eliminado', value: '~20 h/mes' },
    { label: 'Cargos duplicados', value: '0' },
  ];

  byId(next.missions, 'angular-react-migration').metrics = [
    { label: 'Módulos migrados', value: '40+' },
    { label: 'Bundle inicial', value: '−38%' },
    { label: 'Rendimiento del frontend', value: '+40%' },
  ];

  const m004 = byId(next.missions, 'rofe-platforms');
  m004.period = { ...FREELANCE_PERIOD };
  m004.durationLabel = '16 meses';

  const m006 = byId(next.missions, 'kimsa-climate-systems');
  m006.period = { ...FREELANCE_PERIOD };
  m006.durationLabel = '16 meses';
  m006.title = 'Sistemas KIMSA · Consultoría ambiental';
  m006.summary =
    'Sistemas administrativos para KIMSA, firma de consultoría ambiental: backend en NestJS y frontends en Angular y React.';
  m006.description =
    'Desarrollo freelance end-to-end de los sistemas administrativos de KIMSA, firma de consultoría ambiental. Backend en NestJS y frontends en Angular y React, integrados vía APIs REST y desplegados en producción en Heroku y Hostinger.';
  m006.highlights = [
    'Backend en NestJS que centraliza la operación administrativa de la consultora.',
    'Frontends en Angular y React sobre el mismo backend.',
    'Sistemas integrados vía APIs REST y desplegados en Heroku y Hostinger.',
  ];
  m006.cover = {
    ...m006.cover,
    alt: 'Esquemático de los sistemas de KIMSA: fuentes de datos hacia una API en NestJS y un panel de indicadores',
  };
  m006.challenges = [
    'Llevar los procesos administrativos de una consultora ambiental a sistemas desacoplados.',
    'Mantener consistencia entre múltiples frontends sobre un mismo backend.',
  ];

  for (const m of next.missions) m.featured = FEATURED_MISSIONS.has(m.id);
  for (const [id, gallery] of Object.entries(GALLERIES))
    byId(next.missions, id).gallery = gallery;

  // Case study: the payments mission links to its archive record.
  const m001 = byId(next.missions, 'recurring-payments-system');
  m001.links = { ...m001.links, caseStudy: '/archive/idempotencia-en-pagos' };
  m005.links = { ...m005.links, caseStudy: '/archive/migracion-java-go-por-endpoint' };
  const m002 = byId(next.missions, 'angular-react-migration');
  m002.period = { start: '2025-09-01', end: '2026-02-01' };
  m002.durationLabel = '5 meses';
  m002.links = { ...m002.links, caseStudy: '/archive/migracion-angular-react' };
  const m003 = byId(next.missions, 'multichannel-bots');
  m003.links = { ...m003.links, caseStudy: '/archive/bots-multicanal-hexagonal' };

  // Confidential freelance work: no repo or screenshots can be shown, so the
  // briefing says so, and the metrics are only facts that can be verified.
  m004.links = { restricted: true };
  m004.metrics = [
    { label: 'Plataformas', value: '2' },
    { label: 'Duración', value: '16 meses' },
    { label: 'Despliegue', value: 'Azure' },
  ];
  m006.links = { restricted: true };
  m006.metrics = [
    { label: 'Sistemas entregados', value: '3' },
    { label: 'Frontends', value: 'Angular · React' },
    { label: 'Duración', value: '16 meses' },
  ];
  applyOrder(next.missions, MISSION_ORDER);

  // Bitácora
  upsert(next.experience, NEW_EXPERIENCE as Experience);

  const hibot = byId(next.experience, 'log-2022-hibot-fullstack');
  hibot.achievements = [
    'Lideré la migración de 8+ microservicios legacy de Java (Spring Boot) a Go con arquitectura limpia: latencia media de APIs críticas −35 % (800 → 520 ms).',
    'Lideré la migración de Angular a React de aplicaciones estratégicas: rendimiento del frontend +40 %.',
    'Diseñé el sistema de pagos recurrentes: ~20 horas/mes de facturación manual eliminadas.',
    'Optimicé CI/CD en Azure DevOps con Docker y GitHub Actions: tiempo de despliegue −50 %.',
    'Subí la cobertura con tests unitarios y de integración: bugs en producción −30 %.',
  ];
  hibot.technologies = addUnique(hibot.technologies, 'java', 'spring-boot');

  const freelance = byId(next.experience, 'log-2021-freelance');
  freelance.period = { ...FREELANCE_PERIOD };
  freelance.location = 'Remoto';
  freelance.summary = freelance.summary.replace(
    'consultoría de cambio climático',
    'consultoría ambiental',
  );

  applyOrder(next.experience, EXPERIENCE_ORDER);

  // Archivo: the new record goes first (featured); the rest keep their order.
  // Newest first: REG-010 … REG-004.
  const added = [
    MULTICHANNEL_RECORD,
    REFRESH_TOKENS_RECORD,
    RLS_RECORD,
    MCP_OAUTH_RECORD,
    FRONTEND_MIGRATION_RECORD,
    MIGRATION_RECORD,
    NEW_ARCHIVE_RECORD,
  ];
  const addedIds = added.map((r) => r.id);
  const previous = [...current.archiveRecords]
    .sort((a, b) => a.order - b.order)
    .map((r) => r.id)
    .filter((id) => !addedIds.includes(id));
  for (const r of added) upsert(next.archiveRecords, r as ArchiveRecordRow);
  applyOrder(next.archiveRecords, [...addedIds, ...previous]);

  checkConsistency(next);
  return next;
}

/** Guard the invariants the copy relies on before anything is written. */
function checkConsistency(b: Bundle) {
  const techIds = new Set(b.technologies.map((t) => t.id));
  const refs = [
    ...b.missions.map((m) => [m.id, m.technologies] as const),
    ...b.experience.map((e) => [e.id, e.technologies] as const),
  ];
  for (const [owner, ids] of refs) {
    for (const id of ids) {
      if (!techIds.has(id))
        throw new Error(`${owner} referencia la tecnología "${id}", que no existe.`);
    }
  }
  const stat = (label: string) => b.pilot.stats.find((s) => s.label === label)?.value;
  if (stat('Misiones documentadas') !== String(b.missions.length)) {
    throw new Error(
      `La cifra de misiones no coincide con ${b.missions.length} misiones.`,
    );
  }
  if (stat('Sistemas en órbita') !== String(b.technologies.length)) {
    throw new Error(
      `La cifra de sistemas no coincide con ${b.technologies.length} tecnologías.`,
    );
  }
  const tags = b.technologies
    .filter((t) => t.featured)
    .slice(0, 5)
    .map((t) => t.name);
  console.log(`Etiquetas del Puente: ${tags.join(', ')}`);
}

// ── diff ─────────────────────────────────────────────────────────────────────

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** Stable JSON: sorted keys, undefined dropped (matches the API's omitempty). */
function canon(v: unknown): string {
  return JSON.stringify(v, (_k, val: unknown) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(
          Object.entries(val as Record<string, unknown>).sort(([a], [b]) =>
            a.localeCompare(b),
          ),
        )
      : val,
  );
}

const same = (a: unknown, b: unknown) => canon(a) === canon(b);
const show = (v: unknown) =>
  v === undefined ? '∅' : typeof v === 'string' ? `"${v}"` : canon(v);

function diffValue(
  path: string,
  before: Json | undefined,
  after: Json | undefined,
  out: string[],
) {
  if (same(before, after)) return;

  const isObj = (v: unknown): v is Record<string, Json> =>
    !!v && typeof v === 'object' && !Array.isArray(v);

  if (isObj(before) && isObj(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    for (const k of keys) diffValue(`${path}.${k}`, before[k], after[k], out);
    return;
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const b = before.map(canon);
    const a = after.map(canon);
    out.push(`    ${path}:`);
    for (const [i, item] of b.entries()) {
      if (!a.includes(item)) out.push(`      - ${show(before[i])}`);
    }
    for (const [i, item] of a.entries()) {
      if (!b.includes(item)) out.push(`      + ${show(after[i])}`);
    }
    if (b.length === a.length && b.every((x) => a.includes(x))) {
      out.push(`      (mismos elementos, reordenados)`);
    }
    return;
  }

  const long = show(before).length + show(after).length > 90;
  if (long) {
    out.push(`    ${path}:`);
    if (before !== undefined) out.push(`      - ${show(before)}`);
    if (after !== undefined) out.push(`      + ${show(after)}`);
  } else {
    out.push(
      `    ${path}: ${before === undefined ? '∅' : show(before)} → ${after === undefined ? '∅' : show(after)}`,
    );
  }
}

function diffRecord(before: unknown, after: unknown): string[] {
  const out: string[] = [];
  const strip = (v: unknown) => {
    if (!v || typeof v !== 'object') return v as Json;
    const copy = { ...(v as Record<string, Json>) };
    delete copy.usedInMissions;
    return copy as Json;
  };
  for (const [k, v] of Object.entries((strip(after) ?? {}) as Record<string, Json>)) {
    const b =
      before === undefined ? undefined : (strip(before) as Record<string, Json>)[k];
    if (before === undefined) out.push(`    ${k}: ${show(v)}`);
    else diffValue(k, b, v, out);
  }
  return out;
}

interface Change {
  section: string;
  label: string;
  isNew: boolean;
  lines: string[];
  put: () => Promise<void>;
}

// ── HTTP ─────────────────────────────────────────────────────────────────────

/** The slice of GET /export this script reads and writes. */
interface ExportBundle {
  pilot: Pilot;
  technologies: Technology[];
  missions: Mission[];
  experience: Experience[];
  archive: { records: ArchiveRecordRow[] };
}

async function getExport(): Promise<ExportBundle> {
  const res = await fetch(`${BASE}/export`);
  if (!res.ok) throw new Error(`GET /export → ${res.status}`);
  return (await res.json()) as ExportBundle;
}

const toBundle = (e: ExportBundle): Bundle => ({
  pilot: e.pilot,
  technologies: e.technologies,
  missions: e.missions,
  experience: e.experience,
  archiveRecords: e.archive.records,
});

let cookie = '';

async function put(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${BASE}/admin/${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT /admin/${path} → ${res.status}: ${await res.text()}`);
}

/** Read a line from the TTY without echoing it. */
function askPassword(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      reject(
        new Error('--apply necesita una terminal interactiva para pedir la contraseña.'),
      );
      return;
    }
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    let value = '';
    const done = (err?: Error) => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (err) reject(err);
      else resolve(value);
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') return done();
        if (ch === '\u0003') return done(new Error('Cancelado.'));
        if (ch === '\u007f' || ch === '\b') value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on('data', onData);
  });
}

async function login(): Promise<void> {
  const res = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: await askPassword('Contraseña de administrador: '),
    }),
  });
  if (!res.ok) throw new Error(`Login fallido (${res.status}).`);
  cookie = (res.headers.get('set-cookie') ?? '').split(';')[0];
  if (!cookie) throw new Error('La API no devolvió cookie de sesión.');
}

// ── main ─────────────────────────────────────────────────────────────────────

function plan(current: Bundle, desired: Bundle): Change[] {
  const changes: Change[] = [];
  const lists = [
    ['Sistemas', 'technologies', current.technologies, desired.technologies],
    ['Misiones', 'missions', current.missions, desired.missions],
    ['Bitácora', 'experiences', current.experience, desired.experience],
    ['Archivo', 'archive/records', current.archiveRecords, desired.archiveRecords],
  ] as const;

  for (const [section, resource, before, after] of lists) {
    for (const item of after) {
      const prev = (before as { id: string }[]).find((x) => x.id === item.id);
      const lines = diffRecord(prev, item);
      if (!lines.length) continue;
      const code = 'code' in item ? `${item.code} ` : '';
      changes.push({
        section,
        label: `${code}${item.id}`,
        isNew: !prev,
        lines,
        put: () => put(resource, item),
      });
    }
  }

  const pilotLines = diffRecord(current.pilot, desired.pilot);
  if (pilotLines.length) {
    changes.push({
      section: 'Piloto',
      label: 'pilot',
      isNew: false,
      lines: pilotLines,
      put: () => put('pilot', desired.pilot),
    });
  }
  return changes;
}

function print(changes: Change[]) {
  let section = '';
  for (const c of changes) {
    if (c.section !== section) {
      section = c.section;
      console.log(`\n── ${section} ${'─'.repeat(60 - section.length)}`);
    }
    console.log(`  ${c.isNew ? '+ NUEVO' : '~'} ${c.label}`);
    for (const line of c.lines) console.log(line);
  }
}

/** Mirrors scripts/sync-content.ts for the files this update changes. */
function writePreview(b: Bundle) {
  const dir = fileURLToPath(new URL('../src/content/_generated/', import.meta.url));
  const write = (name: string, data: unknown) =>
    writeFileSync(`${dir}${name}.json`, `${JSON.stringify(data, null, 2)}\n`);
  write('missions', b.missions);
  write('archive-records', b.archiveRecords);
  write(
    'archive-manifest',
    b.archiveRecords.map(({ body: _body, refs: _refs, ...meta }) => meta),
  );
  console.log(
    '\nVista previa local escrita en src/content/_generated/ (la API no se tocó).',
  );
  console.log('Para deshacerla: git checkout src/content/_generated');
}

function backup(bundle: unknown): string {
  const dir = fileURLToPath(new URL('../backups/', import.meta.url));
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = `${dir}export-${new URL(BASE).host}-${stamp}.json`;
  writeFileSync(file, `${JSON.stringify(bundle, null, 2)}\n`);
  return file;
}

async function main() {
  console.log(`BG-01 · actualización de contenido oct 2026`);
  console.log(`API: ${BASE} · modo: ${APPLY ? 'APLICAR' : 'dry-run'}\n`);

  const live = await getExport();
  console.log(`✓ respaldo: ${backup(live)}`);

  const current = toBundle(live);
  const desired = target(current);
  const changes = plan(current, desired);

  if (!changes.length) {
    console.log('\nSin cambios: la API ya tiene el contenido objetivo.');
    return;
  }
  print(changes);
  console.log(`\n${changes.length} registros con cambios.`);

  if (PREVIEW_LOCAL) {
    writePreview(desired);
    return;
  }
  if (!APPLY) {
    console.log(
      'Dry-run: no se escribió nada. Vuelve a ejecutar con --apply para aplicar.',
    );
    return;
  }

  await login();
  console.log('✓ sesión iniciada');
  // Technologies first so mission/experience references exist; pilot last.
  for (const c of changes) {
    await c.put();
    console.log(`✓ ${c.section} · ${c.label}`);
  }

  const after = await getExport();
  const remaining = plan(toBundle(after), desired);
  if (remaining.length) {
    print(remaining);
    throw new Error('Verificación: /export no coincide con el contenido objetivo.');
  }
  console.log('\n✓ verificado: /export coincide con el contenido objetivo.');
  console.log('No se publicó nada: revisa en /control y pulsa «Publicar estación».');
}

main().catch((err: unknown) => {
  console.error(`\n✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
