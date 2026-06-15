import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Field, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { archiveSectionsApi, type ArchiveSectionRow } from '@/lib/control/resources';
import { Fieldset, NumberField } from '../components/form/Form';
import { blankSection } from './archiveDraft';
import styles from './ArchiveSectionEditorPage.module.css';

export default function ArchiveSectionEditorPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const isNew = !sectionId;
  const navigate = useNavigate();

  const [draft, setDraft] = useState<ArchiveSectionRow | null>(isNew ? blankSection() : null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    archiveSectionsApi
      .list()
      .then((list) => {
        const found = list.find((s) => s.id === sectionId);
        if (found) setDraft(found);
        else setLoadError('Sección no encontrada.');
      })
      .catch(() => setLoadError('No se pudo cargar la sección. ¿El API está activo?'));
  }, [isNew, sectionId]);

  if (loadError) return <Text tone="accent">{loadError}</Text>;
  if (!draft) return <Text tone="muted">Cargando sección…</Text>;

  const patch = (changes: Partial<ArchiveSectionRow>) => setDraft({ ...draft, ...changes });

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
      await archiveSectionsApi.save(draft);
      navigate(CONTROL.archiveSections);
    } catch {
      setError('No se pudo guardar la sección.');
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Seo
        title={`${isNew ? 'Nueva' : 'Editar'} sección · Centro de Control`}
        description="Editor de sección del archivo."
        noindex
      />

      <header className={styles.editor__head}>
        <p className={styles.editor__eyebrow}>MÓDULO 06 · ARCHIVO · SECCIONES</p>
        <Heading level={1} size="lg">
          {isNew ? 'Nueva sección' : draft.label || 'Editar sección'}
        </Heading>
      </header>

      <form className={styles.editor__form} onSubmit={handleSubmit} noValidate>
        <Fieldset legend="Sección">
          {isNew ? (
            <Field
              label="ID"
              name="id"
              value={draft.id}
              onChange={(v) => patch({ id: v })}
              hint="Identificador corto, p.ej. lng, ing, ops, bit."
              required
            />
          ) : (
            <div className={styles.editor__readonly}>
              <span>ID</span>
              <code>{draft.id}</code>
            </div>
          )}
          <Field
            label="Código"
            name="code"
            value={draft.code}
            onChange={(v) => patch({ code: v })}
            placeholder="S-LNG"
          />
          <Field
            label="Etiqueta"
            name="label"
            value={draft.label}
            onChange={(v) => patch({ label: v })}
            placeholder="Lenguajes"
            required
          />
          <NumberField
            label="Orden"
            value={draft.order}
            onChange={(v) => patch({ order: v })}
          />
        </Fieldset>

        {error && (
          <Text tone="accent" variant="mono">
            {error}
          </Text>
        )}

        <div className={styles.editor__actions}>
          <Button type="submit" icon="signal" loading={saving}>
            {isNew ? 'Crear sección' : 'Guardar cambios'}
          </Button>
          <Button to={CONTROL.archiveSections} variant="ghost">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
