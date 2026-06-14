import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, Panel, Tag, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { experiencesApi } from '@/lib/control/resources';
import type { Experience } from '@/types/domain';
import styles from './ExperiencesListPage.module.css';

export default function ExperiencesListPage() {
  const [items, setItems] = useState<Experience[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(() => {
    setError(undefined);
    experiencesApi
      .list()
      .then(setItems)
      .catch(() => setError('No se pudo cargar el listado. ¿El API está activo?'));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(exp: Experience) {
    if (!window.confirm(`¿Borrar el registro de "${exp.company}"?`)) return;
    try {
      await experiencesApi.remove(exp.id);
      setItems((prev) => prev?.filter((e) => e.id !== exp.id) ?? null);
    } catch {
      setError('No se pudo eliminar el registro.');
    }
  }

  return (
    <div className={styles.exps}>
      <Seo title="Bitácora · Centro de Control" description="Editor de experiencia." noindex />

      <header className={styles.exps__head}>
        <div>
          <p className={styles.exps__eyebrow}>MÓDULO 04 · BITÁCORA</p>
          <Heading level={1} size="lg">
            Experiencia
          </Heading>
        </div>
        <Button to={CONTROL.experienceNew} icon="arrow-right">
          Nuevo registro
        </Button>
      </header>

      {error && (
        <Text tone="accent" variant="mono">
          {error}
        </Text>
      )}

      {items === null && !error && <Text tone="muted">Cargando registros…</Text>}

      {items?.length === 0 && (
        <Text tone="muted">Sin registros. Crea el primero.</Text>
      )}

      <ul className={styles.exps__list}>
        {items?.map((e) => (
          <Panel as="li" key={e.id} className={styles.exps__row}>
            <div className={styles.exps__meta}>
              <Link to={CONTROL.experienceEdit(e.id)} className={styles.exps__company}>
                {e.company}
              </Link>
              <p className={styles.exps__role}>{e.role}</p>
              <span className={styles.exps__period}>
                {e.period.start} — {e.period.end === 'present' ? 'Actualidad' : e.period.end}
              </span>
            </div>

            <div className={styles.exps__tags}>
              <Tag>{e.type}</Tag>
            </div>

            <div className={styles.exps__actions}>
              <Button to={CONTROL.experienceEdit(e.id)} variant="ghost" size="sm">
                Editar
              </Button>
              <button
                type="button"
                className={styles.exps__delete}
                onClick={() => handleDelete(e)}
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
