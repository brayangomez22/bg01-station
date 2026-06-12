import { useCallback } from 'react';
import { Container, SectionHeader, TelemetryLine } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { seoByRoute } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { missions } from '@/content/missions';
import { technologyById } from '@/content/technologies';
import { useMissionFilters } from './hooks/useMissionFilters';
import { MissionFilters } from './components/MissionFilters/MissionFilters';
import { MissionGrid } from './components/MissionGrid/MissionGrid';

export default function MissionsPage() {
  const labelFor = useCallback(
    (techId: string) => technologyById(techId)?.name ?? techId,
    [],
  );
  const { active, setActive, options, filtered } = useMissionFilters(missions, labelFor);

  return (
    <Container>
      <Seo {...seoByRoute.missions} path={ROUTES.missions} />
      <SectionHeader
        eyebrow="MÓDULO 03 · MISIONES"
        title="Registro de misiones"
        description="Bitácora de proyectos completados y en curso. Filtra por la tecnología que impulsó cada misión."
        level={1}
      />
      <MissionFilters options={options} active={active} onChange={setActive} />
      <TelemetryLine live key={active}>
        {filtered.length} {filtered.length === 1 ? 'misión' : 'misiones'} en registro ·
        filtro: {options.find((o) => o.id === active)?.label ?? 'todas'}
      </TelemetryLine>
      <MissionGrid missions={filtered} />
    </Container>
  );
}
