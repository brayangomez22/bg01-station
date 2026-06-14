import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, Panel, Tag, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { frequenciesApi, type FrequencyRow } from '@/lib/control/resources';
import styles from './FrequenciesListPage.module.css';

export default function FrequenciesListPage() {
  const [items, setItems] = useState<FrequencyRow[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(() => {
    setError(undefined);
    frequenciesApi
      .list()
      .then(setItems)
      .catch(() => setError('No se pudo cargar el listado. ¿El API está activo?'));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(freq: FrequencyRow) {
    if (!window.confirm(`¿Cerrar la frecuencia "${freq.label}"?`)) return;
    try {
      await frequenciesApi.remove(freq.id);
      setItems((prev) => prev?.filter((f) => f.id !== freq.id) ?? null);
    } catch {
      setError('No se pudo eliminar la frecuencia.');
    }
  }

  return (
    <div className={styles.freqs}>
      <Seo title="Frecuencias · Centro de Control" description="Editor de contacto." noindex />

      <header className={styles.freqs__head}>
        <div>
          <p className={styles.freqs__eyebrow}>MÓDULO 05 · FRECUENCIAS</p>
          <Heading level={1} size="lg">
            Frecuencias
          </Heading>
        </div>
        <Button to={CONTROL.frequencyNew} icon="arrow-right">
          Nueva frecuencia
        </Button>
      </header>

      {error && (
        <Text tone="accent" variant="mono">
          {error}
        </Text>
      )}

      {items === null && !error && <Text tone="muted">Cargando frecuencias…</Text>}

      {items?.length === 0 && (
        <Text tone="muted">Sin frecuencias. Crea la primera.</Text>
      )}

      <ul className={styles.freqs__list}>
        {items?.map((f) => (
          <Panel as="li" key={f.id} className={styles.freqs__row}>
            <div className={styles.freqs__meta}>
              <Link to={CONTROL.frequencyEdit(f.id)} className={styles.freqs__label}>
                {f.label}
              </Link>
              <span className={styles.freqs__handle}>{f.handle}</span>
            </div>

            <div className={styles.freqs__tags}>
              {f.primary && <Tag>Primaria</Tag>}
              <Tag>{f.icon}</Tag>
            </div>

            <div className={styles.freqs__actions}>
              <Button to={CONTROL.frequencyEdit(f.id)} variant="ghost" size="sm">
                Editar
              </Button>
              <button
                type="button"
                className={styles.freqs__delete}
                onClick={() => handleDelete(f)}
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
