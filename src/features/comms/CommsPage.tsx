import { Container, SectionHeader, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { seoByRoute } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { FrequencyList } from './components/FrequencyList/FrequencyList';
import { TransmissionForm } from './components/TransmissionForm/TransmissionForm';
import styles from './CommsPage.module.css';

export default function CommsPage() {
  return (
    <Container>
      <Seo {...seoByRoute.comms} path={ROUTES.comms} />
      <SectionHeader
        eyebrow="MÓDULO 05 · COMUNICACIONES"
        title="Canal de comunicaciones"
        description="Uplink abierto. Transmite un mensaje directo o sintoniza una de las frecuencias disponibles."
        level={1}
      />

      <div className={styles.comms}>
        <div className={styles.comms__form}>
          <TransmissionForm />
        </div>
        <aside className={styles.comms__channels}>
          <Heading level={2} size="md">
            Frecuencias
          </Heading>
          <Text tone="muted">Canales alternativos para contactar la estación.</Text>
          <FrequencyList />
        </aside>
      </div>
    </Container>
  );
}
