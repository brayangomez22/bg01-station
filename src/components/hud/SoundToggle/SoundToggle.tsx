import { useSound } from '@/app/providers/SoundProvider';
import styles from './SoundToggle.module.css';

/** Accessible mute toggle. Sound is off by default. */
export function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      className={styles['sound-toggle']}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Silenciar estación' : 'Activar sonido de la estación'}
    >
      <span className={styles['sound-toggle__icon']} aria-hidden="true">
        {enabled ? '◉' : '◯'}
      </span>
      <span className={styles['sound-toggle__label']}>
        {enabled ? 'SND ON' : 'SND OFF'}
      </span>
    </button>
  );
}
