import { Heading, Panel, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import styles from './OverviewPage.module.css';

/** Modules the control center will manage, with their backend export keys. */
const MODULES = [
  { code: '01', name: 'Piloto', desc: 'Perfil, bio, manifiesto y estadísticas.' },
  { code: '02', name: 'Sistemas', desc: 'Tecnologías y misiones vinculadas.' },
  { code: '03', name: 'Misiones', desc: 'Proyectos, métricas y enlaces.' },
  { code: '04', name: 'Bitácora', desc: 'Experiencia profesional.' },
  { code: '06', name: 'Archivo', desc: 'Registros y secciones del blog técnico.' },
  { code: '05', name: 'Frecuencias', desc: 'Canales de contacto.' },
  { code: '··', name: 'Textos', desc: 'Copy editable de la estación.' },
] as const;

/** Landing dashboard of the control center (editors arrive in later slices). */
export default function OverviewPage() {
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
          Administra el contenido de cada módulo. Los cambios se publican al
          reconstruir la estación.
        </Text>
      </header>

      <div className={styles.overview__grid}>
        {MODULES.map((m) => (
          <Panel key={m.name} bracketed className={styles.overview__card}>
            <span className={styles['overview__card-code']}>{m.code}</span>
            <Heading level={2} size="md">
              {m.name}
            </Heading>
            <Text tone="muted" variant="caption">
              {m.desc}
            </Text>
            <span className={styles['overview__card-status']}>Editor próximamente</span>
          </Panel>
        ))}
      </div>
    </div>
  );
}
