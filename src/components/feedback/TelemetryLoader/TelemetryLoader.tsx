import { useLocation } from 'react-router-dom';
import { deckOf } from '@/app/router/decks';
import { DeckVignette } from './DeckVignette';
import styles from './TelemetryLoader.module.css';

interface TelemetryLoaderProps {
  label?: string;
}

/**
 * Narrativized Suspense fallback. The router already points at the
 * destination while the chunk loads, so the loader knows which deck the
 * visitor is traveling to: telemetry readout on one side, the deck's crew
 * member getting the module ready on the other (studying in the Archive,
 * logging in the Bitácora…).
 */
export function TelemetryLoader({
  label = 'Recibiendo telemetría',
}: TelemetryLoaderProps) {
  const { pathname } = useLocation();
  const deck = deckOf(pathname);

  return (
    <div className={styles['telemetry-loader']} role="status" aria-live="polite">
      <div className={styles['telemetry-loader__info']}>
        <span className={styles['telemetry-loader__module']} aria-hidden="true">
          MÓDULO {deck.code} · {deck.name.toUpperCase()}
        </span>
        <span className={styles['telemetry-loader__ring']} aria-hidden="true" />
        <span className={styles['telemetry-loader__label']}>{label}…</span>
      </div>
      <DeckVignette deckIndex={deck.index} />
    </div>
  );
}
