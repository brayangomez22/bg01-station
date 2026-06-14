import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, Panel, Tag, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { missionsApi } from '@/lib/control/resources';
import type { Mission } from '@/types/domain';
import styles from './MissionsListPage.module.css';

export default function MissionsListPage() {
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(() => {
    setError(undefined);
    missionsApi
      .list()
      .then(setMissions)
      .catch(() => setError('No se pudo cargar el listado. ¿El API está activo?'));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(mission: Mission) {
    if (!window.confirm(`¿Dar de baja la misión "${mission.title}"?`)) return;
    try {
      await missionsApi.remove(mission.id);
      setMissions((prev) => prev?.filter((m) => m.id !== mission.id) ?? null);
    } catch {
      setError('No se pudo eliminar la misión.');
    }
  }

  return (
    <div className={styles.missions}>
      <Seo title="Misiones · Centro de Control" description="Editor de misiones." noindex />

      <header className={styles.missions__head}>
        <div>
          <p className={styles.missions__eyebrow}>MÓDULO 03 · MISIONES</p>
          <Heading level={1} size="lg">
            Misiones
          </Heading>
        </div>
        <Button to={CONTROL.missionNew} icon="arrow-right">
          Nueva misión
        </Button>
      </header>

      {error && (
        <Text tone="accent" variant="mono">
          {error}
        </Text>
      )}

      {missions === null && !error && <Text tone="muted">Cargando misiones…</Text>}

      {missions?.length === 0 && (
        <Text tone="muted">Sin misiones registradas. Crea la primera.</Text>
      )}

      <ul className={styles.missions__list}>
        {missions?.map((m) => (
          <Panel as="li" key={m.id} className={styles.missions__row}>
            <div className={styles.missions__meta}>
              <span className={styles.missions__code}>{m.code}</span>
              <div>
                <Link to={CONTROL.missionEdit(m.id)} className={styles.missions__title}>
                  {m.title}
                </Link>
                <p className={styles.missions__summary}>{m.summary}</p>
              </div>
            </div>

            <div className={styles.missions__tags}>
              {m.featured && <Tag>Destacada</Tag>}
              <Tag>{m.status}</Tag>
            </div>

            <div className={styles.missions__actions}>
              <Button to={CONTROL.missionEdit(m.id)} variant="ghost" size="sm">
                Editar
              </Button>
              <button
                type="button"
                className={styles.missions__delete}
                onClick={() => handleDelete(m)}
              >
                Eliminar
              </button>
            </div>
          </Panel>
        ))}
      </ul>
    </div>
  );
}
