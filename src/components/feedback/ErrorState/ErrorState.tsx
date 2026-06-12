import { Heading, Text, Button } from '@/components/ui';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Themed error placeholder (e.g. chunk load failure). */
export function ErrorState({
  title = 'Transmisión interrumpida',
  message = 'Se perdió la conexión con este módulo de la estación.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles['error-state']} role="alert">
      <Text variant="mono" tone="accent">
        ⚠ ERROR
      </Text>
      <Heading level={2} size="lg">
        {title}
      </Heading>
      <Text tone="muted">{message}</Text>
      {onRetry && (
        <Button variant="hud" onClick={onRetry}>
          Reintentar transmisión
        </Button>
      )}
    </div>
  );
}
