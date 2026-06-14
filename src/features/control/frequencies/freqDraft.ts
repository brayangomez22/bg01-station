import type { FrequencyRow } from '@/lib/control/resources';

/** Icon options relevant to contact channels. */
export const FREQUENCY_ICON = [
  { value: 'email', label: 'Email' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'external', label: 'Externo' },
  { value: 'signal', label: 'Señal' },
] as const;

/** A blank frequency with every field present, ready to edit. */
export function blankFrequency(): FrequencyRow {
  return {
    id: '',
    label: '',
    handle: '',
    url: '',
    icon: 'email',
    primary: false,
    order: 0,
  };
}
