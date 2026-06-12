import { Text } from '@/components/ui';
import { pilot } from '@/content/pilot';
import styles from './Manifesto.module.css';

export function Manifesto() {
  return (
    <blockquote className={styles.manifesto}>
      <Text variant="mono" tone="accent">
        ▸ MANIFIESTO
      </Text>
      <p className={styles.manifesto__quote}>{pilot.manifesto}</p>
    </blockquote>
  );
}
