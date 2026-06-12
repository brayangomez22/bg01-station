import type { Pilot } from '@/types/domain';

export const pilot: Pilot = {
  name: 'Brayan Gómez',
  callsign: 'BG-01',
  role: 'Full Stack Developer',
  available: true,
  location: 'Medellín, Colombia · Remoto',
  bio: 'Full Stack Developer con 5+ años construyendo aplicaciones web escalables con Go, Angular y React. Especializado en microservicios y APIs REST en el backend, lideré la migración de productos núcleo de Angular a React e integré sistemas de pago con facturación recurrente. Opero CI/CD y despliegues cloud con Azure DevOps y Docker.',
  manifesto:
    'Construyo sistemas como quien diseña una nave: cada componente con un propósito claro, listo para resistir la carga real y fácil de operar a años luz de su lanzamiento.',
  stats: [
    { label: 'Años de vuelo', value: '5+' },
    { label: 'Misiones documentadas', value: '4' },
    { label: 'Sistemas dominados', value: '10' },
  ],
  avatar: {
    src: '/avatar.svg',
    alt: 'Insignia del piloto BG-01: monograma BG dentro de una retícula orbital',
    width: 400,
    height: 400,
  },
  resumeUrl: '/cv-brayan-gomez.pdf',
};
