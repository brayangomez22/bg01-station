import { Container, SectionHeader } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { seoByRoute } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { technologies } from '@/content/technologies';
import { missions } from '@/content/missions';
import { SystemView } from './components/SystemView/SystemView';

export default function SystemsPage() {
  return (
    <Container>
      <Seo {...seoByRoute.systems} path={ROUTES.systems} />
      <SectionHeader
        eyebrow="MÓDULO 02 · SISTEMAS"
        title="Sistema orbital"
        description="Cada tecnología es un planeta en órbita. Selecciona uno para inspeccionar su dominio y las misiones donde fue clave."
        level={1}
      />
      <SystemView technologies={technologies} missions={missions} />
    </Container>
  );
}
