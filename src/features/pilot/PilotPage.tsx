import { Container, SectionHeader } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { seoByRoute } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { PilotCard } from './components/PilotCard/PilotCard';
import { PilotStats } from './components/PilotStats/PilotStats';
import { Manifesto } from './components/Manifesto/Manifesto';
import styles from './PilotPage.module.css';

export default function PilotPage() {
  return (
    <Container>
      <Seo {...seoByRoute.pilot} path={ROUTES.pilot} />
      <SectionHeader
        eyebrow="MÓDULO 01 · PILOTO"
        title="Ficha del piloto"
        description="Credenciales, filosofía y métricas de vuelo del comandante de la estación."
        level={1}
      />
      <div className={styles.pilot}>
        <PilotCard />
        <Manifesto />
        <PilotStats />
      </div>
    </Container>
  );
}
