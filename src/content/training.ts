import type { TrainingSim } from '@/types/domain';

const repoUrl = (repo: string) => `https://github.com/brayangomez22/${repo}`;

/**
 * Hangar-level stats for the training log header. `totalSims` is the count
 * of public repos on GitHub — maintained by hand (no client-side API calls);
 * refresh it occasionally.
 */
export const trainingLog = {
  totalSims: 191,
  sinceYear: 2020,
  hangarUrl: 'https://github.com/brayangomez22?tab=repositories',
};

/**
 * Curated selection: only practices that demonstrate something the missions
 * don't already cover. The full hangar lives on GitHub.
 */
export const trainingSims: TrainingSim[] = [
  {
    repo: 'go-events-cqrs',
    code: 'SIM-001',
    title: 'Eventos y CQRS en Go',
    summary:
      'Microservicios orientados a eventos con patrón CQRS: escrituras y lecturas desacopladas.',
    stack: ['Go', 'CQRS', 'Docker'],
    year: 2023,
    repoUrl: repoUrl('go-events-cqrs'),
  },
  {
    repo: 'go-protobuffers-grpc',
    code: 'SIM-002',
    title: 'gRPC y Protocol Buffers',
    summary:
      'Comunicación entre servicios con contratos tipados y serialización binaria.',
    stack: ['Go', 'gRPC', 'Protobuf'],
    year: 2023,
    repoUrl: repoUrl('go-protobuffers-grpc'),
  },
  {
    repo: 'go-rest-websockets',
    code: 'SIM-003',
    title: 'REST y WebSockets en Go',
    summary: 'API REST con canal de WebSockets para eventos en tiempo real.',
    stack: ['Go', 'WebSockets'],
    year: 2023,
    repoUrl: repoUrl('go-rest-websockets'),
  },
  {
    repo: 'bases-of-concurrency-unit-tests-and-poo-in-go',
    code: 'SIM-004',
    title: 'Concurrencia y testing en Go',
    summary:
      'Goroutines, channels, tests unitarios y orientación a objetos: los cimientos del lenguaje.',
    stack: ['Go', 'Concurrencia', 'Testing'],
    year: 2023,
    repoUrl: repoUrl('bases-of-concurrency-unit-tests-and-poo-in-go'),
  },
  {
    repo: 'rabbitmq-fundamentals',
    code: 'SIM-005',
    title: 'Mensajería con RabbitMQ',
    summary:
      'Fundamentos de colas, exchanges y patrones de publicación/consumo desde Go.',
    stack: ['Go', 'RabbitMQ'],
    year: 2023,
    repoUrl: repoUrl('rabbitmq-fundamentals'),
  },
  {
    repo: 'spring-boot-web-flux-api-rest',
    code: 'SIM-006',
    title: 'API reactiva con WebFlux',
    summary:
      'API REST reactiva y no bloqueante con Spring WebFlux en el ecosistema Java.',
    stack: ['Java', 'Spring WebFlux'],
    year: 2022,
    repoUrl: repoUrl('spring-boot-web-flux-api-rest'),
  },
  {
    repo: 'nest-pokemons',
    code: 'SIM-007',
    title: 'API REST con NestJS',
    summary:
      'DTOs, validación, paginación y semillas sobre MongoDB, contenedorizado con Docker.',
    stack: ['NestJS', 'MongoDB', 'Docker'],
    year: 2023,
    repoUrl: repoUrl('nest-pokemons'),
  },
  {
    repo: 'next-teslo-shop',
    code: 'SIM-008',
    title: 'E-commerce fullstack con Next.js',
    summary:
      'Tienda completa: catálogo, carrito, autenticación, pasarela de pago y panel de administración sobre MongoDB.',
    stack: ['Next.js', 'TypeScript', 'MongoDB'],
    year: 2023,
    repoUrl: repoUrl('next-teslo-shop'),
  },
  {
    repo: 'react-maps-app',
    code: 'SIM-009',
    title: 'Mapas interactivos en React',
    summary: 'Geolocalización, marcadores y rutas sobre mapas con TypeScript.',
    stack: ['React', 'TypeScript'],
    year: 2023,
    repoUrl: repoUrl('react-maps-app'),
  },
  {
    repo: 'reactivex',
    code: 'SIM-010',
    title: 'Programación reactiva con RxJS',
    summary:
      'Flujos asíncronos con Observables, operadores y composición de streams — el paradigma reactivo que sostiene Angular.',
    stack: ['RxJS', 'TypeScript'],
    year: 2022,
    repoUrl: repoUrl('reactivex'),
  },
  {
    repo: 'todo-app-redux',
    code: 'SIM-011',
    title: 'Patrón Redux en Angular',
    summary: 'Gestión de estado global con el patrón Redux aplicado a Angular.',
    stack: ['Angular', 'Redux', 'TypeScript'],
    year: 2021,
    repoUrl: repoUrl('todo-app-redux'),
  },
  {
    repo: 'TeamOne',
    code: 'SIM-012',
    title: 'TeamOne · LMS en equipo',
    summary:
      'Sistema de gestión de aprendizaje construido en equipo durante la formación inicial.',
    stack: ['JavaScript', 'PHP', 'CSS'],
    year: 2020,
    repoUrl: repoUrl('TeamOne'),
  },
];
