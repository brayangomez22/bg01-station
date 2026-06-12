import type { Pilot } from '@/types/domain';

export const pilot: Pilot = {
  name: 'Brayan Gómez',
  callsign: 'BG-01',
  role: 'Backend Developer · Arquitecto de Sistemas',
  available: true,
  location: 'Colombia · Remoto',
  bio: 'Backend Developer especializado en construir sistemas robustos, escalables y de alto rendimiento. Trabajo principalmente con Go y NestJS, modelo datos en MongoDB y opero infraestructura en AWS. Me obsesiona el código mantenible y las arquitecturas que envejecen bien.',
  manifesto:
    'Construyo sistemas como quien diseña una nave: cada componente con un propósito claro, listo para resistir la carga real y fácil de operar a años luz de su lanzamiento.',
  stats: [
    { label: 'Años de vuelo', value: '5+' },
    { label: 'Misiones documentadas', value: '4' },
    { label: 'Sistemas dominados', value: '7' },
  ],
  avatar: {
    src: '/avatar.svg',
    alt: 'Insignia del piloto BG-01: monograma BG dentro de una retícula orbital',
    width: 400,
    height: 400,
  },
  resumeUrl: '/cv-brayan-gomez.pdf',
};
