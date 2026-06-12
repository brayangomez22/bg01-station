import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { deckOf } from '@/app/router/decks';
import { OPEN_CONSOLE_EVENT } from '@/components/console/CommandConsole/CommandConsole';
import { OPEN_MAP_EVENT } from '@/components/map/StationMap/StationMap';
import { AmbientStatus } from '@/components/hud/AmbientStatus/AmbientStatus';
import { StatusIndicator } from '@/components/hud/StatusIndicator/StatusIndicator';
import { SoundToggle } from '@/components/hud/SoundToggle/SoundToggle';
import { pilot } from '@/content/pilot';
import styles from './HudFrame.module.css';

/** Stamped deck label for the current route (the station knows where you are). */
function deckLabel(pathname: string): string {
  const deck = deckOf(pathname);
  return `DECK ${deck.code} — ${deck.name.toUpperCase()}`;
}

/**
 * Persistent HUD: decorative corner brackets + a top telemetry bar.
 * Lives in the StationShell, outside the animated <Outlet>, so it never
 * remounts between route changes.
 */
export function HudFrame() {
  const { pathname } = useLocation();

  // Once content scrolls under the instruments, the bar gains a glass
  // backing (same elevation language as the NavDock) to stay legible.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={styles['hud-frame']}
      data-scrolled={scrolled || undefined}
      aria-hidden="false"
    >
      {/* Decorative corner brackets (double stroke, instrument-frame style) */}
      <span className={styles['hud-frame__corner']} data-pos="tl" aria-hidden="true" />
      <span className={styles['hud-frame__corner']} data-pos="tr" aria-hidden="true" />
      <span className={styles['hud-frame__corner']} data-pos="bl" aria-hidden="true" />
      <span className={styles['hud-frame__corner']} data-pos="br" aria-hidden="true" />

      {/* Stamped hull microcopy along the sides (desktop only) */}
      <span className={styles['hud-frame__stamp']} data-side="left" aria-hidden="true">
        BG-01 · ORBITAL PLATFORM
      </span>
      <span className={styles['hud-frame__stamp']} data-side="right" aria-hidden="true">
        {deckLabel(pathname)}
      </span>

      <div className={styles['hud-frame__topbar']}>
        <div className={styles['hud-frame__topbar-left']}>
          <StatusIndicator
            label={`${pilot.callsign} · ${pilot.available ? 'ONLINE' : 'OFFLINE'}`}
            state={pilot.available ? 'online' : 'offline'}
          />
          <AmbientStatus />
        </div>
        <div className={styles['hud-frame__topbar-right']}>
          <button
            type="button"
            className={styles['hud-frame__cmd']}
            onClick={() => window.dispatchEvent(new CustomEvent(OPEN_MAP_EVENT))}
            aria-label="Abrir esquemático de la estación"
          >
            [ MAPA ]
          </button>
          <button
            type="button"
            className={styles['hud-frame__cmd']}
            onClick={() => window.dispatchEvent(new CustomEvent(OPEN_CONSOLE_EVENT))}
            aria-label="Abrir consola de comandos (Ctrl+K)"
            title="Ctrl+K"
          >
            [ CMD ]
          </button>
          <a
            href={pilot.resumeUrl}
            download
            className={styles['hud-frame__dossier']}
            aria-label="Descargar CV (dossier del piloto)"
          >
            [ DOSSIER ]
          </a>
          <SoundToggle />
        </div>
      </div>
    </div>
  );
}
