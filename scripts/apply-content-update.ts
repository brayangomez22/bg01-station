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
    proficiency: 0,
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
    proficiency: 0,
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
    proficiency: 0,
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
    proficiency: 0,
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
    proficiency: 0,
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
    proficiency: 0,
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
    proficiency: 0,
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
  // Newest first: REG-006, REG-005, then REG-004.
  const added = [FRONTEND_MIGRATION_RECORD, MIGRATION_RECORD, NEW_ARCHIVE_RECORD];
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
