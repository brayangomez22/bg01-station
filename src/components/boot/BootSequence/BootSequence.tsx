import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useBoot } from '@/app/providers/BootProvider';
import { useSound } from '@/app/providers/SoundProvider';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { dockVisitor, type VisitorManifest } from '@/lib/visitor';
import { pilot } from '@/content/pilot';
import styles from './BootSequence.module.css';

const BASE_LINES = [
  'auth piloto.................. OK',
  'cargando sistemas............ OK',
  'sincronizando misiones....... OK',
  'enlace de comunicaciones..... OK',
];

/** Closing lines depend on the visitor manifest: first docking assigns an
    ID, re-docking is recognized. No storage → the original anonymous greeting. */
function bootLines(visitor: VisitorManifest | null): string[] {
  if (!visitor) return [...BASE_LINES, 'bienvenido a bordo, visitante'];
  if (visitor.visits <= 1) {
    return [
      ...BASE_LINES,
      `registro de visitante........ ${visitor.id}`,
      'bienvenido a bordo',
    ];
  }
  return [
    ...BASE_LINES,
    `re-acoplamiento detectado · visita ${String(visitor.visits).padStart(2, '0')}`,
    `bienvenido de nuevo, ${visitor.id}`,
  ];
}

/** Max time the overlay may hold the screen, even on a cold cache. */
const MAX_BOOT_MS = 1600;
/** Pause after reaching 100% before auto-docking. */
const AUTO_DOCK_DELAY_MS = 400;

/**
 * Docking sequence overlay — a flourish, never a toll.
 * Progress is driven by real asset readiness (fonts) with a hard time cap,
 * auto-docks on completion, and can be skipped with ESC at any moment.
 */
export function BootSequence() {
  const { complete } = useBoot();
  const { play } = useSound();
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const fontsReady = useRef(false);

  // Docking registers the visit; dockVisitor is idempotent per session.
  const [lines] = useState(() => bootLines(dockVisitor()));

  const ready = progress >= 100;
  const visibleLines = Math.ceil((progress / 100) * lines.length);

  // ESC skips the whole sequence, from frame one.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') complete();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [complete]);

  useEffect(() => {
    if (reduced) {
      setProgress(100);
      return;
    }

    document.fonts?.ready.then(() => {
      fontsReady.current = true;
    });

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      // Time-based ramp capped at MAX_BOOT_MS; fonts arriving early lets the
      // bar sprint to 100 instead of waiting out the full window.
      const timeTarget = Math.min((elapsed / MAX_BOOT_MS) * 100, 100);
      const target = fontsReady.current
        ? Math.min(timeTarget + (elapsed / 300) * 40, 100)
        : Math.min(timeTarget, 92);
      setProgress(target);
      if (target < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Auto-dock shortly after the link is established — no mandatory click.
  useEffect(() => {
    if (!ready) return;
    play('dock');
    const id = setTimeout(complete, reduced ? 0 : AUTO_DOCK_DELAY_MS);
    return () => clearTimeout(id);
  }, [ready, reduced, complete, play]);

  return (
    <motion.div
      className={styles['boot-sequence']}
      role="dialog"
      aria-label="Secuencia de conexión a la estación BG-01"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className={styles['boot-sequence__inner']}>
        <p className={styles['boot-sequence__callsign']}>◜ {pilot.callsign} ◝</p>
        <p className={styles['boot-sequence__status']}>
          {ready ? 'ENLACE ESTABLECIDO' : 'ESTABLECIENDO ENLACE…'}
        </p>

        <div
          className={styles['boot-sequence__bar']}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className={styles['boot-sequence__bar-fill']}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={styles['boot-sequence__pct']} data-readout>
          {Math.round(progress)}%
        </p>

        <ul className={styles['boot-sequence__log']} role="list">
          {lines.slice(0, visibleLines).map((line) => (
            <li
              key={line}
              className={styles['boot-sequence__log-line']}
              style={{ ['--chars' as string]: line.length }}
            >
              <span aria-hidden="true">&gt; </span>
              {line}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles['boot-sequence__dock']}
          onClick={complete}
          data-ready={ready || undefined}
        >
          {ready ? '[ ACCEDIENDO… ]' : '[ ACCEDER YA ]'}
        </button>

        <p className={styles['boot-sequence__skip']}>ESC para omitir</p>
      </div>
    </motion.div>
  );
}
