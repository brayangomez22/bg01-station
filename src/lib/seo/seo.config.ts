/**
 * SEO configuration consumed by the <Seo> component (React 19 native
 * document metadata). Centralizes per-route titles & descriptions.
 */

export const SITE = {
  name: 'BG-01 Space Station',
  url: 'https://brayangomez22.github.io',
  author: 'Brayan Gómez',
  locale: 'es_ES',
  ogImage: '/og-image.png',
} as const;

export interface SeoMeta {
  title: string;
  description: string;
}

const TITLE_SUFFIX = '· BG-01 Space Station';

export function pageTitle(title: string): string {
  return `${title} ${TITLE_SUFFIX}`;
}

export const seoByRoute = {
  bridge: {
    title: pageTitle('Puente de mando'),
    description:
      'Conéctate a la estación BG-01: el portafolio inmersivo de Brayan Gómez, Backend Developer especializado en Go, NestJS y AWS.',
  },
  pilot: {
    title: pageTitle('Ficha del piloto'),
    description:
      'Conoce a Brayan Gómez, Backend Developer y arquitecto de sistemas. Credenciales, manifiesto y trayectoria.',
  },
  systems: {
    title: pageTitle('Sistemas orbitales'),
    description:
      'Las tecnologías de Brayan como planetas en órbita: Go, TypeScript, NestJS, Angular, React, MongoDB y AWS.',
  },
  missions: {
    title: pageTitle('Registro de misiones'),
    description:
      'Proyectos completados por Brayan Gómez: APIs de alto rendimiento, microservicios y sistemas en tiempo real.',
  },
  logbook: {
    title: pageTitle('Bitácora de vuelo'),
    description:
      'La trayectoria profesional de Brayan Gómez registrada como bitácora espacial.',
  },
  comms: {
    title: pageTitle('Comunicaciones'),
    description:
      'Abre un canal con la estación BG-01. Contacta a Brayan Gómez por sus frecuencias disponibles.',
  },
  archive: {
    title: pageTitle('Archivo de conocimiento'),
    description:
      'El blog técnico de Brayan Gómez como archivo de la estación BG-01: registros sobre Go, TypeScript, arquitectura, backend, DevOps y Linux.',
  },
  notFound: {
    title: pageTitle('Señal perdida'),
    description: 'La coordenada solicitada no existe en la estación BG-01.',
  },
} as const satisfies Record<string, SeoMeta>;
