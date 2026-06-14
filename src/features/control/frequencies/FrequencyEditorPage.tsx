import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Field, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { frequenciesApi, type FrequencyRow } from '@/lib/control/resources';
import type { IconName } from '@/types/common';
import { CheckboxField, Fieldset, NumberField, SelectField } from '../components/form/Form';
import { FREQUENCY_ICON, blankFrequency } from './freqDraft';
import styles from './FrequencyEditorPage.module.css';

export default function FrequencyEditorPage() {
  const { freqId } = useParams<{ freqId: string }>();
  const isNew = !freqId;
  const navigate = useNavigate();

  const [draft, setDraft] = useState<FrequencyRow | null>(isNew ? blankFrequency() : null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    frequenciesApi
      .list()
      .then((list) => {
        const found = list.find((f) => f.id === freqId);
        if (found) setDraft(found);
        else setLoadError('Frecuencia no encontrada.');
      })
      .catch(() => setLoadError('No se pudo cargar la frecuencia. ¿El API está activo?'));
  }, [isNew, freqId]);

  if (loadError) return <Text tone="accent">{loadError}</Text>;
  if (!draft) return <Text tone="muted">Cargando frecuencia…</Text>;

  const patch = (changes: Partial<FrequencyRow>) => setDraft({ ...draft, ...changes });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.id.trim() || !draft.label.trim()) {
      setError('ID y etiqueta son obligatorios.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await frequenciesApi.save(draft);
      navigate(CONTROL.frequencies);
    } catch {
      setError('No se pudo guardar la frecuencia.');
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Seo
        title={`${isNew ? 'Nueva' : 'Editar'} frecuencia · Centro de Control`}
        description="Editor de frecuencia."
        noindex
      />

      <header className={styles.editor__head}>
        <p className={styles.editor__eyebrow}>MÓDULO 05 · FRECUENCIAS</p>
        <Heading level={1} size="lg">
          {isNew ? 'Nueva frecuencia' : draft.label || 'Editar frecuencia'}
        </Heading>
      </header>

      <form className={styles.editor__form} onSubmit={handleSubmit} noValidate>
        <Fieldset legend="Canal">
          {isNew ? (
            <Field
              label="ID"
              name="id"
              value={draft.id}
              onChange={(v) => patch({ id: v })}
              hint="Identificador único, p.ej. email, github, linkedin."
              required
            />
          ) : (
            <div className={styles.editor__readonly}>
              <span>ID</span>
              <code>{draft.id}</code>
            </div>
          )}
          <Field
            label="Etiqueta"
            name="label"
            value={draft.label}
            onChange={(v) => patch({ label: v })}
            placeholder="Frecuencia directa"
            required
          />
          <Field
            label="Handle"
            name="handle"
            value={draft.handle}
            onChange={(v) => patch({ handle: v })}
            placeholder="@brayangomez22"
          />
          <Field
            label="URL"
            name="url"
            value={draft.url}
            onChange={(v) => patch({ url: v })}
            placeholder="https://github.com/brayangomez22"
          />
          <SelectField
            label="Icono"
            value={draft.icon}
            onChange={(v) => patch({ icon: v as IconName })}
            options={FREQUENCY_ICON}
          />
        </Fieldset>

        <Fieldset legend="Orden y prioridad">
          <NumberField
            label="Orden"
            value={draft.order}
            onChange={(v) => patch({ order: v })}
          />
          <CheckboxField
            label="Frecuencia primaria"
            checked={draft.primary}
            onChange={(v) => patch({ primary: v })}
          />
        </Fieldset>

        {error && (
          <Text tone="accent" variant="mono">
            {error}
          </Text>
        )}

        <div className={styles.editor__actions}>
          <Button type="submit" icon="signal" loading={saving}>
            {isNew ? 'Crear frecuencia' : 'Guardar cambios'}
          </Button>
          <Button to={CONTROL.frequencies} variant="ghost">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
