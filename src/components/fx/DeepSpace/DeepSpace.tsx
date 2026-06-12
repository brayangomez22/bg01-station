import styles from './DeepSpace.module.css';

/**
 * Station-wide deep-space view: a ringed gas giant low on the horizon, a
 * distant moon, and the occasional comet. Pure SVG + CSS — no raster, no
 * filters, transform/opacity animations only.
 *
 * The planet's "rotation" is the classic trick: the disc is static while
 * dashed latitude bands drift horizontally inside a clipPath. The rings
 * sway on their own, much slower. Everything is decoration: aria-hidden
 * and pointer-transparent.
 */
export function DeepSpace() {
  return (
    <div className={styles['deep-space']} aria-hidden="true">
      {/* Distant moon, drifting imperceptibly */}
      <svg className={styles.moon} viewBox="0 0 48 48" focusable="false">
        <defs>
          <radialGradient id="ds-moon" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#2a3450" />
            <stop offset="55%" stopColor="#161c2e" />
            <stop offset="100%" stopColor="#080a12" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="14" fill="url(#ds-moon)" />
        <path
          d="M 14 16 A 14 14 0 0 1 31 12"
          fill="none"
          stroke="rgb(125 239 255 / 0.35)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      {/* Ringed giant on the lower horizon */}
      <svg className={styles.planet} viewBox="0 0 240 240" focusable="false">
        <defs>
          <radialGradient id="ds-body" cx="36%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#222c47" />
            <stop offset="45%" stopColor="#131a2c" />
            <stop offset="100%" stopColor="#06080f" />
          </radialGradient>
          <clipPath id="ds-disc">
            <circle cx="120" cy="120" r="62" />
          </clipPath>
        </defs>

        <g transform="rotate(-14 120 120)">
          {/* Rings, far side (painted under the disc) */}
          <g className={styles.rings}>
            <ellipse cx="120" cy="120" rx="112" ry="26" className={styles.ringOuter} />
            <ellipse cx="120" cy="120" rx="99" ry="22" className={styles.ringMid} />
            <ellipse cx="120" cy="120" rx="87" ry="18.5" className={styles.ringInner} />
            {/* Particle clump orbiting the outer ring: a single dash whose
                offset circulates the ellipse (perimeter ≈ 476.5), slipping
                behind the planet on the far side. */}
            <ellipse cx="120" cy="120" rx="112" ry="26" className={styles.ringFlow} />
          </g>

          {/* Planet body */}
          <circle cx="120" cy="120" r="62" fill="url(#ds-body)" className={styles.body} />

          {/* Surface: drifting latitude bands = axial rotation */}
          <g clipPath="url(#ds-disc)">
            <g className={styles.bands}>
              {/* Each band repeats every 42px of dash period; the drift loops
                  at 84px, so the cycle is seamless. */}
              <path className={styles.band} style={{ strokeDasharray: '30 12' }} d="M -50 96 Q 120 84 290 96" />
              <path className={styles.band} style={{ strokeDasharray: '22 20', opacity: 0.5 }} d="M -50 113 Q 120 104 290 113" />
              <path className={styles.band} style={{ strokeDasharray: '36 6', opacity: 0.35 }} d="M -50 132 Q 120 138 290 132" />
              <path className={styles.band} style={{ strokeDasharray: '16 26', opacity: 0.45 }} d="M -50 150 Q 120 158 290 150" />
            </g>
            {/* Shadow the rings cast across the disc */}
            <ellipse
              cx="120"
              cy="120"
              rx="112"
              ry="26"
              className={styles.ringShadow}
            />
            {/* Night side: darkened lower-right limb */}
            <circle cx="150" cy="146" r="78" className={styles.terminator} />
          </g>

          {/* Day-side rim light */}
          <path
            className={styles.rim}
            d="M 66 91 A 62 62 0 0 1 149 64"
            fill="none"
          />

          {/* Rings, near side (front arc painted over the disc) */}
          <g className={styles.ringsFront}>
            <path className={styles.ringOuter} d="M 8 120 A 112 26 0 0 0 232 120" fill="none" />
            <path className={styles.ringMid} d="M 21 120 A 99 22 0 0 0 219 120" fill="none" />
            <path className={styles.ringInner} d="M 33 120 A 87 18.5 0 0 0 207 120" fill="none" />
          </g>
        </g>
      </svg>

      {/* Occasional comets, each on its own trajectory and cycle */}
      <span className={`${styles.comet} ${styles.cometA}`} />
      <span className={`${styles.comet} ${styles.cometB}`} />
      <span className={`${styles.comet} ${styles.cometC}`} />
    </div>
  );
}
