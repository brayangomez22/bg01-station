import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, Panel, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { siteCopyApi, type SiteCopyEntry } from '@/lib/control/resources';
import styles from './SiteCopyListPage.module.css';

export default function SiteCopyListPage() {
  const [items, setItems] = useState<SiteCopyEntry[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(() => {
    setError(undefined);
    siteCopyApi
      .list()
      .then(setItems)
      .catch(() => setError('No se pudo cargar el listado. ¿El API está activo?'));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(entry: SiteCopyEntry) {
    if (!window.confirm(`¿Borrar el texto "${entry.key}"?`)) return;
    try {
      await siteCopyApi.remove(entry.key);
      setItems((prev) => prev?.filter((e) => e.key !== entry.key) ?? null);
    } catch {
      setError('No se pudo eliminar el texto.');
    }
  }

  return (
    <div className={styles.copy}>
      <Seo title="Textos · Centro de Control" description="Editor de copy." noindex />

      <header className={styles.copy__head}>
        <div>
          <p className={styles.copy__eyebrow}>MÓDULO ·· · TEXTOS</p>
          <Heading level={1} size="lg">
            Textos editables
          </Heading>
        </div>
        <Button to={CONTROL.siteCopyNew} icon="arrow-right">
          Nuevo texto
        </Button>
      </header>

      {error && (
        <Text tone="accent" variant="mono">
          {error}
        </Text>
      )}

      {items === null && !error && <Text tone="muted">Cargando textos…</Text>}

      {items?.length === 0 && <Text tone="muted">Sin textos. Crea el primero.</Text>}

      <ul className={styles.copy__list}>
        {items?.map((e) => (
          <Panel as="li" key={e.key} className={styles.copy__row}>
            <div className={styles.copy__meta}>
              <Link to={CONTROL.siteCopyEdit(e.key)} className={styles.copy__key}>
                {e.key}
              </Link>
              <p className={styles.copy__value}>{e.value}</p>
            </div>

            <div className={styles.copy__actions}>
              <Button to={CONTROL.siteCopyEdit(e.key)} variant="ghost" size="sm">
                Editar
              </Button>
              <button
                type="button"
                className={styles.copy__delete}
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
