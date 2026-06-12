import type { Frequency } from '@/types/domain';

/** Communication channels — "frequencies" to reach the station. */
export const frequencies: Frequency[] = [
  {
    id: 'email',
    label: 'Frecuencia directa',
    handle: 'gomezmancobrayanalexander@gmail.com',
    url: 'mailto:gomezmancobrayanalexander@gmail.com',
    icon: 'email',
    primary: true,
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: '@brayangomez22',
    url: 'https://github.com/brayangomez22',
    icon: 'github',
    primary: false,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'in/brayangomez-dev',
    url: 'https://www.linkedin.com/in/brayangomez-dev/',
    icon: 'linkedin',
    primary: false,
  },
];
