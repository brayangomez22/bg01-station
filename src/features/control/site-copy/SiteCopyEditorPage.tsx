import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Field, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { siteCopyApi, type SiteCopyEntry } from '@/lib/control/resources';
import { Fieldset } from '../components/form/Form';
import styles from './SiteCopyEditorPage.module.css';

export default function SiteCopyEditorPage() {
  const { copyKey } = useParams<{ copyKey: string }>();
  const isNew = !copyKey;
  const navigate = useNavigate();

  const [draft, setDraft] = useState<SiteCopyEntry | null>(
    isNew ? { key: '', value: '' } : null,
  );
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    siteCopyApi
      .list()
      .then((list) => {
        const found = list.find((e) => e.key === copyKey);
        if (found) setDraft(found);
        else setLoadError('Texto no encontrado.');
      })
      .catch(() => setLoadError('No se pudo cargar el texto. ¿El API está activo?'));
  }, [isNew, copyKey]);

  if (loadError) return <Text tone="accent">{loadError}</Text>;
  if (!draft) return <Text tone="muted">Cargando texto…</Text>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.key.trim()) {
      setError('La clave es obligatoria.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await siteCopyApi.save(draft);
      navigate(CONTROL.siteCopy);
    } catch {
      setError('No se pudo guardar el texto.');
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Seo
        title={`${isNew ? 'Nuevo' : 'Editar'} texto · Centro de Control`}
        description="Editor de copy."
        noindex
      />

      <header className={styles.editor__head}>
        <p className={styles.editor__eyebrow}>MÓDULO ·· · TEXTOS</p>
        <Heading level={1} size="lg">
          {isNew ? 'Nuevo texto' : draft.key || 'Editar texto'}
        </Heading>
      </header>

      <form className={styles.editor__form} onSubmit={handleSubmit} noValidate>
        <Fieldset legend="Texto">
          {isNew ? (
            <Field
              label="Clave"
              name="key"
              value={draft.key}
              onChange={(v) => setDraft({ ...draft, key: v })}
              hint="Identificador del texto, p.ej. comms.intro."
              required
            />
          ) : (
            <div className={styles.editor__readonly}>
              <span>Clave</span>
              <code>{draft.key}</code>
            </div>
          )}
          <Field
            label="Valor"
            name="value"
            as="textarea"
            rows={5}
            value={draft.value}
            onChange={(v) => setDraft({ ...draft, value: v })}
          />
        </Fieldset>

        {error && (
          <Text tone="accent" variant="mono">
            {error}
          </Text>
        )}

        <div className={styles.editor__actions}>
          <Button type="submit" icon="signal" loading={saving}>
            {isNew ? 'Crear texto' : 'Guardar cambios'}
          </Button>
          <Button to={CONTROL.siteCopy} variant="ghost">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
