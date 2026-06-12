import { Container, Heading, Text, Button } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { seoByRoute } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import styles from './NotFoundPage.module.css';

/** 404 — signal lost. Eager (must render even if a chunk fails). */
export function NotFoundPage() {
  return (
    <Container>
      <Seo {...seoByRoute.notFound} />
      <div className={styles['signal-lost']}>
        <Text variant="mono" tone="accent">
          ERROR 404 · SEÑAL PERDIDA
        </Text>
        <Heading level={1} size="hero">
          Coordenada inexistente
        </Heading>
        <Text variant="lead" tone="muted" className={styles['signal-lost__msg']}>
          La estación BG-01 no encuentra esta ruta en su mapa estelar. La señal se ha
          perdido en el vacío.
        </Text>
        <Button to={ROUTES.bridge} variant="primary" icon="arrow-left">
          Volver al puente
        </Button>
      </div>
    </Container>
  );
}
