import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, Panel, Tag, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { technologiesApi } from '@/lib/control/resources';
import type { Technology } from '@/types/domain';
import styles from './TechnologiesListPage.module.css';

export default function TechnologiesListPage() {
  const [techs, setTechs] = useState<Technology[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(() => {
    setError(undefined);
    technologiesApi
      .list()
      .then(setTechs)
      .catch(() => setError('No se pudo cargar el listado. ¿El API está activo?'));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(tech: Technology) {
    if (!window.confirm(`¿Retirar la tecnología "${tech.name}"?`)) return;
    try {
      await technologiesApi.remove(tech.id);
      setTechs((prev) => prev?.filter((t) => t.id !== tech.id) ?? null);
    } catch {
      setError('No se pudo eliminar la tecnología.');
    }
  }

  return (
    <div className={styles.techs}>
      <Seo title="Sistemas · Centro de Control" description="Editor de tecnologías." noindex />

      <header className={styles.techs__head}>
        <div>
          <p className={styles.techs__eyebrow}>MÓDULO 02 · SISTEMAS</p>
          <Heading level={1} size="lg">
            Tecnologías
          </Heading>
        </div>
        <Button to={CONTROL.technologyNew} icon="arrow-right">
          Nueva tecnología
        </Button>
      </header>

      {error && (
        <Text tone="accent" variant="mono">
          {error}
        </Text>
      )}

      {techs === null && !error && <Text tone="muted">Cargando tecnologías…</Text>}

      {techs?.length === 0 && (
        <Text tone="muted">Sin tecnologías registradas. Crea la primera.</Text>
      )}

      <ul className={styles.techs__list}>
        {techs?.map((t) => (
          <Panel as="li" key={t.id} className={styles.techs__row}>
            <div className={styles.techs__meta}>
              <Link to={CONTROL.technologyEdit(t.id)} className={styles.techs__name}>
                {t.name}
              </Link>
              <span className={styles.techs__prof}>{t.proficiency}%</span>
            </div>

            <div className={styles.techs__tags}>
              {t.featured && <Tag>Destacada</Tag>}
              <Tag>{t.category}</Tag>
            </div>

            <div className={styles.techs__actions}>
              <Button to={CONTROL.technologyEdit(t.id)} variant="ghost" size="sm">
                Editar
              </Button>
              <button
                type="button"
                className={styles.techs__delete}
                onClick={() => handleDelete(t)}
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
