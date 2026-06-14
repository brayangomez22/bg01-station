import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Field, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { experiencesApi } from '@/lib/control/resources';
import type { Experience } from '@/types/domain';
import {
  CheckboxField,
  Fieldset,
  NumberField,
  SelectField,
  StringListField,
} from '../components/form/Form';
import { EMPLOYMENT_TYPE, blankExperience } from './expDraft';
import styles from './ExperienceEditorPage.module.css';

export default function ExperienceEditorPage() {
  const { expId } = useParams<{ expId: string }>();
  const isNew = !expId;
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Experience | null>(isNew ? blankExperience() : null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    experiencesApi
      .list()
      .then((list) => {
        const found = list.find((e) => e.id === expId);
        if (found) setDraft(found);
        else setLoadError('Registro no encontrado.');
      })
      .catch(() => setLoadError('No se pudo cargar el registro. ¿El API está activo?'));
  }, [isNew, expId]);

  if (loadError) return <Text tone="accent">{loadError}</Text>;
  if (!draft) return <Text tone="muted">Cargando registro…</Text>;

  const patch = (changes: Partial<Experience>) => setDraft({ ...draft, ...changes });
  const ongoing = draft.period.end === 'present';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.id.trim() || !draft.company.trim()) {
      setError('ID y empresa son obligatorios.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await experiencesApi.save(draft);
      navigate(CONTROL.experiences);
    } catch {
      setError('No se pudo guardar el registro.');
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Seo
        title={`${isNew ? 'Nuevo' : 'Editar'} registro · Centro de Control`}
        description="Editor de experiencia."
        noindex
      />

      <header className={styles.editor__head}>
        <p className={styles.editor__eyebrow}>MÓDULO 04 · BITÁCORA</p>
        <Heading level={1} size="lg">
          {isNew ? 'Nuevo registro' : draft.company || 'Editar registro'}
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
              hint="Identificador único, p.ej. hibot-fullstack."
              required
            />
          ) : (
            <div className={styles.editor__readonly}>
              <span>ID</span>
              <code>{draft.id}</code>
            </div>
          )}
          <Field
            label="Empresa"
            name="company"
            value={draft.company}
            onChange={(v) => patch({ company: v })}
            required
          />
          <Field
            label="Rol"
            name="role"
            value={draft.role}
            onChange={(v) => patch({ role: v })}
          />
          <Field
            label="Ubicación"
            name="location"
            value={draft.location}
            onChange={(v) => patch({ location: v })}
            placeholder="Remoto"
          />
          <SelectField
            label="Tipo de empleo"
            value={draft.type}
            onChange={(v) => patch({ type: v as Experience['type'] })}
            options={EMPLOYMENT_TYPE}
          />
        </Fieldset>

        <Fieldset legend="Periodo">
          <Field
            label="Inicio"
            name="periodStart"
            type="date"
            value={draft.period.start}
            onChange={(v) => patch({ period: { ...draft.period, start: v } })}
          />
          <CheckboxField
            label="En curso (actualidad)"
            checked={ongoing}
            onChange={(v) =>
              patch({ period: { ...draft.period, end: v ? 'present' : '' } })
            }
          />
          {!ongoing && (
            <Field
              label="Fin"
              name="periodEnd"
              type="date"
              value={draft.period.end}
              onChange={(v) => patch({ period: { ...draft.period, end: v } })}
            />
          )}
        </Fieldset>

        <Fieldset legend="Narrativa">
          <Field
            label="Resumen"
            name="summary"
            as="textarea"
            rows={3}
            value={draft.summary}
            onChange={(v) => patch({ summary: v })}
          />
        </Fieldset>

        <Fieldset legend="Listas">
          <StringListField
            label="Responsabilidades"
            items={draft.responsibilities}
            onChange={(v) => patch({ responsibilities: v })}
          />
          <StringListField
            label="Logros"
            items={draft.achievements}
            onChange={(v) => patch({ achievements: v })}
          />
          <StringListField
            label="Tecnologías (ids)"
            items={draft.technologies}
            onChange={(v) => patch({ technologies: v })}
            placeholder="go"
          />
        </Fieldset>

        <Fieldset legend="Orden">
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
          <Button to={CONTROL.experiences} variant="ghost">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
