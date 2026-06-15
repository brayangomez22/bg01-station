import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Field, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import {
  archiveRecordsApi,
  archiveSectionsApi,
  type ArchiveRecordRow,
  type ArchiveSectionRow,
} from '@/lib/control/resources';
import { Fieldset, NumberField, SelectField, StringListField } from '../components/form/Form';
import { BodyField } from './BodyField';
import { blankRecord } from './archiveDraft';
import styles from './ArchiveRecordEditorPage.module.css';

export default function ArchiveRecordEditorPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const isNew = !recordId;
  const navigate = useNavigate();

  const [draft, setDraft] = useState<ArchiveRecordRow | null>(isNew ? blankRecord() : null);
  const [sections, setSections] = useState<ArchiveSectionRow[]>([]);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      archiveSectionsApi.list(),
      isNew ? Promise.resolve(null) : archiveRecordsApi.list(),
    ])
      .then(([secs, records]) => {
        setSections(secs);
        if (!isNew) {
          const found = records!.find((r) => r.id === recordId);
          if (found) setDraft(found);
          else setLoadError('Registro no encontrado.');
        } else if (secs.length > 0) {
          // Default the section to the first option so the controlled select
          // and the draft state agree (a blank value matches no <option>).
          setDraft((d) => (d ? { ...d, section: d.section || secs[0].id } : d));
        }
      })
      .catch(() => setLoadError('No se pudo cargar el registro. ¿El API está activo?'));
  }, [isNew, recordId]);

  if (loadError) return <Text tone="accent">{loadError}</Text>;
  if (!draft) return <Text tone="muted">Cargando registro…</Text>;

  const patch = (changes: Partial<ArchiveRecordRow>) => setDraft({ ...draft, ...changes });

  const sectionOptions = sections.map((s) => ({
    value: s.id,
    label: `${s.code} · ${s.label}`,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.id.trim() || !draft.title.trim() || !draft.section.trim()) {
      setError('ID, título y sección son obligatorios.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await archiveRecordsApi.save(draft);
      navigate(CONTROL.archive);
    } catch {
      setError('No se pudo guardar el registro.');
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Seo
        title={`${isNew ? 'Nuevo' : 'Editar'} registro · Centro de Control`}
        description="Editor del archivo."
        noindex
      />

      <header className={styles.editor__head}>
        <p className={styles.editor__eyebrow}>MÓDULO 06 · ARCHIVO</p>
        <Heading level={1} size="lg">
          {isNew ? 'Nuevo registro' : draft.title || 'Editar registro'}
        </Heading>
      </header>

      <form className={styles.editor__form} onSubmit={handleSubmit} noValidate>
        <Fieldset legend="Identidad">
          {isNew ? (
            <Field
              label="ID (slug)"
              name="id"
              value={draft.id}
              onChange={(v) => patch({ id: v })}
              hint="Identificador en la URL, p.ej. goroutines-que-no-mueren."
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
            placeholder="REG-001"
          />
          <Field
            label="Título"
            name="title"
            value={draft.title}
            onChange={(v) => patch({ title: v })}
            required
          />
          {sectionOptions.length > 0 ? (
            <SelectField
              label="Sección"
              value={draft.section}
              onChange={(v) => patch({ section: v })}
              options={sectionOptions}
            />
          ) : (
            <Text tone="muted" variant="caption">
              No hay secciones. Crea una en “Secciones” antes de asignarla.
            </Text>
          )}
        </Fieldset>

        <Fieldset legend="Metadatos">
          <Field
            label="Resumen (abstract)"
            name="abstract"
            as="textarea"
            rows={2}
            value={draft.abstract}
            onChange={(v) => patch({ abstract: v })}
          />
          <StringListField
            label="Tags"
            items={draft.tags}
            onChange={(v) => patch({ tags: v })}
            placeholder="GO"
          />
          <Field
            label="Fecha de archivo"
            name="archivedAt"
            type="date"
            value={draft.archivedAt}
            onChange={(v) => patch({ archivedAt: v })}
          />
          <NumberField
            label="Minutos de lectura"
            value={draft.readingMinutes}
            onChange={(v) => patch({ readingMinutes: v })}
            min={1}
          />
        </Fieldset>

        <Fieldset legend="Cuerpo">
          <BodyField segments={draft.body} onChange={(body) => patch({ body })} />
        </Fieldset>

        <Fieldset legend="Referencias y orden">
          <StringListField
            label="Referencias (ids de otros registros)"
            items={draft.refs}
            onChange={(v) => patch({ refs: v })}
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
            {isNew ? 'Crear registro' : 'Guardar cambios'}
          </Button>
          <Button to={CONTROL.archive} variant="ghost">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
