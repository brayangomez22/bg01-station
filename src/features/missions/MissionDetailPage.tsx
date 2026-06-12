import { useParams } from 'react-router-dom';
import { Container, Heading, Text, Button } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { pageTitle, SITE } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { missionById } from '@/content/missions';
import { MissionBriefing } from './components/MissionBriefing/MissionBriefing';
import styles from './MissionDetailPage.module.css';

export default function MissionDetailPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const mission = missionId ? missionById(missionId) : undefined;

  if (!mission) {
    return (
      <Container>
        <Seo
          title={pageTitle('Misión no encontrada')}
          description="La misión solicitada no existe en el registro de la estación BG-01."
        />
        <div className={styles['mission-detail__missing']}>
          <Text variant="mono" tone="accent">
            ⚠ REGISTRO INEXISTENTE
          </Text>
          <Heading level={1} size="xl">
            Misión no encontrada
          </Heading>
          <Text tone="muted">
            El código de misión no figura en el registro de la estación.
          </Text>
          <Button to={ROUTES.missions} variant="primary" icon="arrow-left">
            Volver al registro
          </Button>
        </div>
      </Container>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: mission.title,
    abstract: mission.summary,
    url: `${SITE.url}${ROUTES.missionDetail(mission.id)}`,
    author: { '@type': 'Person', name: 'Brayan Gómez' },
  };

  return (
    <Container>
      <Seo
        title={pageTitle(mission.title)}
        description={mission.summary}
        path={ROUTES.missionDetail(mission.id)}
        jsonLd={jsonLd}
      />
      <MissionBriefing mission={mission} />
    </Container>
  );
}
