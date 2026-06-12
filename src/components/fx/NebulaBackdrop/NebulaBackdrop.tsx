import styles from './NebulaBackdrop.module.css';

/** Slow animated radial gradient for depth. Pure CSS, GPU-friendly. */
export function NebulaBackdrop() {
  return <div className={styles.nebula} aria-hidden="true" />;
}
