import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, Panel, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { archiveSectionsApi, type ArchiveSectionRow } from '@/lib/control/resources';
import styles from './ArchiveSectionsListPage.module.css';

export default function ArchiveSectionsListPage() {
  const [items, setItems] = useState<ArchiveSectionRow[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(() => {
    setError(undefined);
    archiveSectionsApi
      .list()
      .then(setItems)
      .catch(() => setError('No se pudo cargar el listado. ¿El API está activo?'));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(sec: ArchiveSectionRow) {
    if (!window.confirm(`¿Eliminar la sección "${sec.label}"?`)) return;
    try {
      await archiveSectionsApi.remove(sec.id);
      setItems((prev) => prev?.filter((s) => s.id !== sec.id) ?? null);
    } catch {
      setError('No se pudo eliminar la sección.');
    }
  }

  return (
    <div className={styles.secs}>
      <Seo title="Secciones · Centro de Control" description="Secciones del archivo." noindex />

      <header className={styles.secs__head}>
        <div>
          <p className={styles.secs__eyebrow}>MÓDULO 06 · ARCHIVO · SECCIONES</p>
          <Heading level={1} size="lg">
            Secciones
          </Heading>
        </div>
        <div className={styles.secs__cta}>
          <Button to={CONTROL.archive} variant="ghost">
            Registros
          </Button>
          <Button to={CONTROL.archiveSectionNew} icon="arrow-right">
            Nueva sección
          </Button>
        </div>
      </header>

      {error && (
        <Text tone="accent" variant="mono">
          {error}
        </Text>
      )}

      {items === null && !error && <Text tone="muted">Cargando secciones…</Text>}

      {items?.length === 0 && <Text tone="muted">Sin secciones. Crea la primera.</Text>}

      <ul className={styles.secs__list}>
        {items?.map((s) => (
          <Panel as="li" key={s.id} className={styles.secs__row}>
            <div className={styles.secs__meta}>
              <span className={styles.secs__code}>{s.code}</span>
              <Link to={CONTROL.archiveSectionEdit(s.id)} className={styles.secs__label}>
                {s.label}
              </Link>
            </div>

            <div className={styles.secs__actions}>
              <Button to={CONTROL.archiveSectionEdit(s.id)} variant="ghost" size="sm">
                Editar
              </Button>
              <button
                type="button"
                className={styles.secs__delete}
                onClick={() => handleDelete(s)}
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
