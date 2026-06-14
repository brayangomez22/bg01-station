import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Field, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { technologiesApi } from '@/lib/control/resources';
import type { Technology } from '@/types/domain';
import { CheckboxField, Fieldset, NumberField, SelectField } from '../components/form/Form';
import { PLANET_SIZE, TECH_CATEGORY, blankTechnology } from './techDraft';
import styles from './TechnologyEditorPage.module.css';

export default function TechnologyEditorPage() {
  const { techId } = useParams<{ techId: string }>();
  const isNew = !techId;
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Technology | null>(isNew ? blankTechnology() : null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    technologiesApi
      .list()
      .then((list) => {
        const found = list.find((t) => t.id === techId);
        if (found) setDraft(found);
        else setLoadError('Tecnología no encontrada.');
      })
      .catch(() => setLoadError('No se pudo cargar la tecnología. ¿El API está activo?'));
  }, [isNew, techId]);

  if (loadError) return <Text tone="accent">{loadError}</Text>;
  if (!draft) return <Text tone="muted">Cargando tecnología…</Text>;

  const patch = (changes: Partial<Technology>) => setDraft({ ...draft, ...changes });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.id.trim() || !draft.name.trim()) {
      setError('ID y nombre son obligatorios.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await technologiesApi.save(draft);
      navigate(CONTROL.technologies);
    } catch {
      setError('No se pudo guardar la tecnología.');
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Seo
        title={`${isNew ? 'Nueva' : 'Editar'} tecnología · Centro de Control`}
        description="Editor de tecnología."
        noindex
      />

      <header className={styles.editor__head}>
        <p className={styles.editor__eyebrow}>MÓDULO 02 · SISTEMAS</p>
        <Heading level={1} size="lg">
          {isNew ? 'Nueva tecnología' : draft.name || 'Editar tecnología'}
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
              hint="Identificador único, p.ej. go, typescript."
              required
            />
          ) : (
            <div className={styles.editor__readonly}>
              <span>ID</span>
              <code>{draft.id}</code>
            </div>
          )}
          <Field
            label="Nombre"
            name="name"
            value={draft.name}
            onChange={(v) => patch({ name: v })}
            required
          />
          <SelectField
            label="Categoría"
            value={draft.category}
            onChange={(v) => patch({ category: v as Technology['category'] })}
            options={TECH_CATEGORY}
          />
        </Fieldset>

        <Fieldset legend="Dominio">
          <NumberField
            label="Dominio (0-100)"
            value={draft.proficiency}
            onChange={(v) => patch({ proficiency: v })}
            min={0}
            max={100}
          />
          <Field
            label="Desde"
            name="since"
            type="date"
            value={draft.since}
            onChange={(v) => patch({ since: v })}
          />
          <Field
            label="Descripción"
            name="description"
            as="textarea"
            rows={3}
            value={draft.description}
            onChange={(v) => patch({ description: v })}
          />
        </Fieldset>

        <Fieldset legend="Planeta (visualización orbital)">
          <Field
            label="Color (token CSS)"
            name="planetColor"
            value={draft.planet.color}
            onChange={(v) => patch({ planet: { ...draft.planet, color: v } })}
            placeholder="--color-accent"
          />
          <SelectField
            label="Tamaño"
            value={draft.planet.size}
            onChange={(v) =>
              patch({ planet: { ...draft.planet, size: v as Technology['planet']['size'] } })
            }
            options={PLANET_SIZE}
          />
          <NumberField
            label="Órbita (1 = más cercana)"
            value={draft.planet.orbit}
            onChange={(v) => patch({ planet: { ...draft.planet, orbit: v } })}
            min={1}
          />
        </Fieldset>

        <Fieldset legend="Orden y visibilidad">
          <NumberField
            label="Orden"
            value={draft.order}
            onChange={(v) => patch({ order: v })}
          />
          <CheckboxField
            label="Tecnología destacada"
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
            {isNew ? 'Crear tecnología' : 'Guardar cambios'}
          </Button>
          <Button to={CONTROL.technologies} variant="ghost">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
