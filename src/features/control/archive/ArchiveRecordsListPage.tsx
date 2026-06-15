import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, Panel, Tag, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { archiveRecordsApi, type ArchiveRecordRow } from '@/lib/control/resources';
import styles from './ArchiveRecordsListPage.module.css';

export default function ArchiveRecordsListPage() {
  const [items, setItems] = useState<ArchiveRecordRow[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(() => {
    setError(undefined);
    archiveRecordsApi
      .list()
      .then(setItems)
      .catch(() => setError('No se pudo cargar el listado. ¿El API está activo?'));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(rec: ArchiveRecordRow) {
    if (!window.confirm(`¿Archivar de baja "${rec.title}"?`)) return;
    try {
      await archiveRecordsApi.remove(rec.id);
      setItems((prev) => prev?.filter((r) => r.id !== rec.id) ?? null);
    } catch {
      setError('No se pudo eliminar el registro.');
    }
  }

  return (
    <div className={styles.recs}>
      <Seo title="Archivo · Centro de Control" description="Editor del archivo." noindex />

      <header className={styles.recs__head}>
        <div>
          <p className={styles.recs__eyebrow}>MÓDULO 06 · ARCHIVO</p>
          <Heading level={1} size="lg">
            Registros
          </Heading>
        </div>
        <div className={styles.recs__cta}>
          <Button to={CONTROL.archiveSections} variant="ghost">
            Secciones
          </Button>
          <Button to={CONTROL.archiveNew} icon="arrow-right">
            Nuevo registro
          </Button>
        </div>
      </header>

      {error && (
        <Text tone="accent" variant="mono">
          {error}
        </Text>
      )}

      {items === null && !error && <Text tone="muted">Cargando registros…</Text>}

      {items?.length === 0 && <Text tone="muted">Sin registros. Crea el primero.</Text>}

      <ul className={styles.recs__list}>
        {items?.map((r) => (
          <Panel as="li" key={r.id} className={styles.recs__row}>
            <div className={styles.recs__meta}>
              <span className={styles.recs__code}>{r.code}</span>
              <div>
                <Link to={CONTROL.archiveEdit(r.id)} className={styles.recs__title}>
                  {r.title}
                </Link>
                <p className={styles.recs__abstract}>{r.abstract}</p>
              </div>
            </div>

            <div className={styles.recs__tags}>
              <Tag>{r.section}</Tag>
            </div>

            <div className={styles.recs__actions}>
              <Button to={CONTROL.archiveEdit(r.id)} variant="ghost" size="sm">
                Editar
              </Button>
              <button
                type="button"
                className={styles.recs__delete}
                onClick={() => handleDelete(r)}
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
