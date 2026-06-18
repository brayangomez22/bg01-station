import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Heading, Panel, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { publish } from '@/lib/control/publish';
import { ApiError } from '@/lib/control/client';
import { TrafficPanel } from './components/TrafficPanel/TrafficPanel';
import styles from './OverviewPage.module.css';

/** Modules the control center manages, with their editor route. */
const MODULES = [
  { code: '01', name: 'Piloto', desc: 'Perfil, bio, manifiesto y estadísticas.', route: CONTROL.pilot },
  { code: '02', name: 'Sistemas', desc: 'Tecnologías y misiones vinculadas.', route: CONTROL.technologies },
  { code: '03', name: 'Misiones', desc: 'Proyectos, métricas y enlaces.', route: CONTROL.missions },
  { code: '04', name: 'Bitácora', desc: 'Experiencia profesional.', route: CONTROL.experiences },
  { code: '06', name: 'Archivo', desc: 'Registros y secciones del blog técnico.', route: CONTROL.archive },
  { code: '05', name: 'Frecuencias', desc: 'Canales de contacto.', route: CONTROL.frequencies },
  { code: '··', name: 'Textos', desc: 'Copy editable de la estación.', route: CONTROL.siteCopy },
] as const;

type PublishState =
  | { kind: 'idle' }
  | { kind: 'publishing' }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

/** Landing dashboard of the control center. */
export default function OverviewPage() {
  const [state, setState] = useState<PublishState>({ kind: 'idle' });

  async function handlePublish() {
    setState({ kind: 'publishing' });
    try {
      await publish();
      setState({ kind: 'done' });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 503
          ? 'Publicación no configurada en el servidor (falta el token de GitHub).'
          : err instanceof ApiError
            ? err.message
            : 'No se pudo disparar la publicación.';
      setState({ kind: 'error', message });
    }
  }

  return (
    <div className={styles.overview}>
      <Seo
        title="Resumen · Centro de Control BG-01"
        description="Panel de administración de la estación."
        noindex
      />

      <header className={styles.overview__head}>
        <p className={styles.overview__eyebrow}>CENTRO DE CONTROL · OPERATIVO</p>
        <Heading level={1} size="lg">
          Sistemas de la estación
        </Heading>
        <Text tone="muted">
          Administra el contenido de cada módulo. Los cambios viven en el API; al
          publicar, la estación se reconstruye con el contenido más reciente.
        </Text>
      </header>

      <TrafficPanel />

      <Panel bracketed className={styles.overview__publish}>
        <div className={styles['overview__publish-copy']}>
          <Heading level={2} size="md">
            Publicar estación
          </Heading>
          <Text tone="muted" variant="caption">
            Dispara la reconstrucción y el despliegue del sitio público en GitHub
            Actions. El build corre en segundo plano (~1–2 min).
          </Text>
          {state.kind === 'done' && (
            <Text tone="accent" variant="caption">
              ✓ Despliegue disparado. La estación se reconstruirá en breve.
            </Text>
          )}
          {state.kind === 'error' && (
            <Text tone="accent" variant="mono">
              {state.message}
            </Text>
          )}
        </div>
        <Button
          icon="signal"
          onClick={() => void handlePublish()}
          loading={state.kind === 'publishing'}
        >
          Publicar
        </Button>
      </Panel>

      <div className={styles.overview__grid}>
        {MODULES.map((m) => (
          <Link key={m.name} to={m.route} className={styles['overview__card-link']}>
            <Panel bracketed className={styles.overview__card}>
              <span className={styles['overview__card-code']}>{m.code}</span>
              <Heading level={3} size="md">
                {m.name}
              </Heading>
              <Text tone="muted" variant="caption">
                {m.desc}
              </Text>
              <span className={styles['overview__card-status']}>Abrir editor →</span>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
