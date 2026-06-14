import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Field, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { missionsApi } from '@/lib/control/resources';
import type { Mission } from '@/types/domain';
import {
  CheckboxField,
  Fieldset,
  MetricListField,
  NumberField,
  SelectField,
  StringListField,
} from '../components/form/Form';
import { MISSION_STATUS, blankMission } from './missionDraft';
import styles from './MissionEditorPage.module.css';

export default function MissionEditorPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const isNew = !missionId;
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Mission | null>(isNew ? blankMission() : null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    missionsApi
      .list()
      .then((list) => {
        const found = list.find((m) => m.id === missionId);
        if (found) setDraft(found);
        else setLoadError('Misión no encontrada.');
      })
      .catch(() => setLoadError('No se pudo cargar la misión. ¿El API está activo?'));
  }, [isNew, missionId]);

  if (loadError) return <Text tone="accent">{loadError}</Text>;
  if (!draft) return <Text tone="muted">Cargando misión…</Text>;

  const patch = (changes: Partial<Mission>) => setDraft({ ...draft, ...changes });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.id.trim() || !draft.code.trim() || !draft.title.trim()) {
      setError('ID, código y título son obligatorios.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await missionsApi.save(draft);
      navigate(CONTROL.missions);
    } catch {
      setError('No se pudo guardar la misión.');
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Seo
        title={`${isNew ? 'Nueva' : 'Editar'} misión · Centro de Control`}
        description="Editor de misión."
        noindex
      />

      <header className={styles.editor__head}>
        <p className={styles.editor__eyebrow}>MÓDULO 03 · MISIONES</p>
        <Heading level={1} size="lg">
          {isNew ? 'Nueva misión' : draft.title || 'Editar misión'}
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
              hint="Identificador único en la URL, p.ej. sistema-de-pagos."
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
            placeholder="M-001"
            required
          />
          <Field
            label="Título"
            name="title"
            value={draft.title}
            onChange={(v) => patch({ title: v })}
            required
          />
          <Field
            label="Rol"
            name="role"
            value={draft.role}
            onChange={(v) => patch({ role: v })}
            placeholder="Full Stack Developer · backend en Go"
          />
        </Fieldset>

        <Fieldset legend="Narrativa">
          <Field
            label="Resumen"
            name="summary"
            as="textarea"
            rows={2}
            value={draft.summary}
            onChange={(v) => patch({ summary: v })}
          />
          <Field
            label="Descripción"
            name="description"
            as="textarea"
            rows={5}
            value={draft.description}
            onChange={(v) => patch({ description: v })}
          />
        </Fieldset>

        <Fieldset legend="Periodo y estado">
          <SelectField
            label="Estado"
            value={draft.status}
            onChange={(v) => patch({ status: v as Mission['status'] })}
            options={MISSION_STATUS}
          />
          <Field
            label="Duración (etiqueta)"
            name="durationLabel"
            value={draft.durationLabel}
            onChange={(v) => patch({ durationLabel: v })}
            placeholder="7 meses"
          />
          <Field
            label="Inicio"
            name="periodStart"
            type="date"
            value={draft.period.start}
            onChange={(v) => patch({ period: { ...draft.period, start: v } })}
          />
          <Field
            label="Fin (vacío = en curso)"
            name="periodEnd"
            type="date"
            value={draft.period.end ?? ''}
            onChange={(v) => patch({ period: { ...draft.period, end: v } })}
          />
        </Fieldset>

        <Fieldset legend="Listas">
          <StringListField
            label="Tecnologías (ids)"
            items={draft.technologies}
            onChange={(v) => patch({ technologies: v })}
            placeholder="go"
          />
          <StringListField
            label="Highlights"
            items={draft.highlights}
            onChange={(v) => patch({ highlights: v })}
          />
          <StringListField
            label="Retos"
            items={draft.challenges}
            onChange={(v) => patch({ challenges: v })}
          />
          <MetricListField
            label="Métricas"
            items={draft.metrics ?? []}
            onChange={(v) => patch({ metrics: v })}
          />
        </Fieldset>

        <Fieldset legend="Enlaces">
          <Field
            label="Demo (live)"
            name="linkLive"
            value={draft.links.live ?? ''}
            onChange={(v) => patch({ links: { ...draft.links, live: v || undefined } })}
          />
          <Field
            label="Repositorio"
            name="linkRepo"
            value={draft.links.repo ?? ''}
            onChange={(v) => patch({ links: { ...draft.links, repo: v || undefined } })}
          />
          <Field
            label="Caso de estudio"
            name="linkCase"
            value={draft.links.caseStudy ?? ''}
            onChange={(v) =>
              patch({ links: { ...draft.links, caseStudy: v || undefined } })
            }
          />
        </Fieldset>

        <Fieldset legend="Portada">
          <Field
            label="Imagen (src)"
            name="coverSrc"
            value={draft.cover.src}
            onChange={(v) => patch({ cover: { ...draft.cover, src: v } })}
            placeholder="/covers/m-001.svg"
          />
          <Field
            label="Texto alternativo"
            name="coverAlt"
            value={draft.cover.alt}
            onChange={(v) => patch({ cover: { ...draft.cover, alt: v } })}
          />
          <div className={styles.editor__cols}>
            <NumberField
              label="Ancho"
              value={draft.cover.width}
              onChange={(v) => patch({ cover: { ...draft.cover, width: v } })}
            />
            <NumberField
              label="Alto"
              value={draft.cover.height}
              onChange={(v) => patch({ cover: { ...draft.cover, height: v } })}
            />
          </div>
        </Fieldset>

        <Fieldset legend="Orden y visibilidad">
          <NumberField
            label="Orden"
            value={draft.order}
            onChange={(v) => patch({ order: v })}
          />
          <CheckboxField
            label="Misión destacada"
            checked={draft.featured}
            onChange={(v) => patch({ featured: v })}
          />
        </Fieldset>

        {error && (
          <Text tone="accent" variant="mono">
            {error}
          </Text>
        )}

        <div className={styles.editor__actions}>
          <Button type="submit" icon="signal" loading={saving}>
            {isNew ? 'Crear misión' : 'Guardar cambios'}
          </Button>
          <Button to={CONTROL.missions} variant="ghost">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
