import { useEffect, useState } from 'react';
import { Button, Field, Heading, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { pilotApi } from '@/lib/control/resources';
import type { Pilot } from '@/types/domain';
import {
  CheckboxField,
  Fieldset,
  MetricListField,
  NumberField,
} from '../components/form/Form';
import styles from './PilotEditorPage.module.css';

export default function PilotEditorPage() {
  const [draft, setDraft] = useState<Pilot | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    pilotApi
      .get()
      .then(setDraft)
      .catch(() => setLoadError('No se pudo cargar el piloto. ¿El API está activo?'));
  }, []);

  if (loadError) return <Text tone="accent">{loadError}</Text>;
  if (!draft) return <Text tone="muted">Cargando piloto…</Text>;

  const patch = (changes: Partial<Pilot>) => {
    setDraft({ ...draft, ...changes });
    setSaved(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim() || !draft.callsign.trim()) {
      setError('Nombre e indicativo son obligatorios.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      const updated = await pilotApi.save(draft);
      setDraft(updated);
      setSaved(true);
    } catch {
      setError('No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.pilot}>
      <Seo title="Piloto · Centro de Control" description="Editor del piloto." noindex />

      <header className={styles.pilot__head}>
        <p className={styles.pilot__eyebrow}>MÓDULO 01 · PILOTO</p>
        <Heading level={1} size="lg">
          Piloto
        </Heading>
      </header>

      <form className={styles.pilot__form} onSubmit={handleSubmit} noValidate>
        <Fieldset legend="Identidad">
          <Field
            label="Nombre"
            name="name"
            value={draft.name}
            onChange={(v) => patch({ name: v })}
            required
          />
          <Field
            label="Indicativo (callsign)"
            name="callsign"
            value={draft.callsign}
            onChange={(v) => patch({ callsign: v })}
            placeholder="BG-01"
            required
          />
          <Field
            label="Rol"
            name="role"
            value={draft.role}
            onChange={(v) => patch({ role: v })}
            placeholder="Full Stack Developer"
          />
          <Field
            label="Ubicación"
            name="location"
            value={draft.location}
            onChange={(v) => patch({ location: v })}
            placeholder="Medellín, Colombia · Remoto"
          />
          <CheckboxField
            label="Disponible para misiones"
            checked={draft.available}
            onChange={(v) => patch({ available: v })}
          />
        </Fieldset>

        <Fieldset legend="Narrativa">
          <Field
            label="Bio"
            name="bio"
            as="textarea"
            rows={3}
            value={draft.bio}
            onChange={(v) => patch({ bio: v })}
          />
          <Field
            label="Manifiesto"
            name="manifesto"
            as="textarea"
            rows={3}
            value={draft.manifesto}
            onChange={(v) => patch({ manifesto: v })}
          />
        </Fieldset>

        <Fieldset legend="Estadísticas">
          <MetricListField
            label="Stats"
            items={draft.stats}
            onChange={(v) => patch({ stats: v })}
          />
        </Fieldset>

        <Fieldset legend="Insignia (avatar)">
          <Field
            label="Imagen (src)"
            name="avatarSrc"
            value={draft.avatar.src}
            onChange={(v) => patch({ avatar: { ...draft.avatar, src: v } })}
            placeholder="/avatar.svg"
          />
          <Field
            label="Texto alternativo"
            name="avatarAlt"
            value={draft.avatar.alt}
            onChange={(v) => patch({ avatar: { ...draft.avatar, alt: v } })}
          />
          <div className={styles.pilot__cols}>
            <NumberField
              label="Ancho"
              value={draft.avatar.width}
              onChange={(v) => patch({ avatar: { ...draft.avatar, width: v } })}
            />
            <NumberField
              label="Alto"
              value={draft.avatar.height}
              onChange={(v) => patch({ avatar: { ...draft.avatar, height: v } })}
            />
          </div>
        </Fieldset>

        <Fieldset legend="Dossier">
          <Field
            label="URL del CV"
            name="resumeUrl"
            value={draft.resumeUrl}
            onChange={(v) => patch({ resumeUrl: v })}
            placeholder="/cv-brayan-gomez.pdf"
          />
        </Fieldset>

        {error && (
          <Text tone="accent" variant="mono">
            {error}
          </Text>
        )}

        <div className={styles.pilot__actions}>
          <Button type="submit" icon="signal" loading={saving}>
            Guardar cambios
          </Button>
          {saved && (
            <span className={styles.pilot__saved}>Cambios guardados ✓</span>
          )}
        </div>
      </form>
    </div>
  );
}
