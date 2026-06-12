import styles from './HullTexture.module.css';

/**
 * Hull atmosphere: photographic grain + soft vignette.
 * Replaces the old CRT scanlines — the station is advanced, not retro.
 * Pure CSS, zero JS, two fixed layers.
 */
export function HullTexture() {
  return (
    <div className={styles.hull} aria-hidden="true">
      <div className={styles.hull__grain} />
      <div className={styles.hull__vignette} />
    </div>
  );
}
