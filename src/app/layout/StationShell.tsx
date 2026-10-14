import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ScrollRestoration, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useBoot } from '@/app/providers/BootProvider';
import { useSound } from '@/app/providers/SoundProvider';
import { useHydrated } from '@/hooks/useHydrated';
import { useStationShift } from '@/hooks/useStationShift';
import { deckOf, travelDirection } from '@/app/router/decks';
import { RouteTransition } from '@/app/router/RouteTransition';
import { HudFrame } from '@/components/hud/HudFrame/HudFrame';
import { NavDock } from '@/components/hud/NavDock/NavDock';
import { NebulaBackdrop } from '@/components/fx/NebulaBackdrop/NebulaBackdrop';
import { DeepSpace } from '@/components/fx/DeepSpace/DeepSpace';
import { HullTexture } from '@/components/fx/HullTexture/HullTexture';
import { CustomCursor } from '@/components/fx/CustomCursor/CustomCursor';
import { TelemetryLoader } from '@/components/feedback/TelemetryLoader/TelemetryLoader';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary/ErrorBoundary';
import { BootSequence } from '@/components/boot/BootSequence/BootSequence';
import { CommandConsole } from '@/components/console/CommandConsole/CommandConsole';
import { StationMap } from '@/components/map/StationMap/StationMap';
import styles from './StationShell.module.css';

// Heavy background canvas: lazy + mounted after hydration, never blocks content
// (and never part of the prerendered HTML).
const Starfield = lazy(() =>
  import('@/components/fx/Starfield/Starfield').then((m) => ({
    default: m.Starfield,
  })),
);

export function StationShell() {
  const { booting } = useBoot();
  const { play } = useSound();
  const shift = useStationShift();
  const hydrated = useHydrated();
  const location = useLocation();
  const outlet = useOutlet();

  // Deck travel direction, derived during render when the deck changes (so
  // exit and enter animate the same way) and kept until the next trip.
  const deck = deckOf(location.pathname).index;
  const [travel, setTravel] = useState({ deck, direction: 0 as -1 | 0 | 1 });
  if (travel.deck !== deck) {
    setTravel({ deck, direction: travelDirection(travel.deck, deck) });
  }
  const direction = travel.direction;

  // Arrival chord only on actual deck changes (silent while sound is off).
  const arrivedDeckRef = useRef(deck);
  useEffect(() => {
    if (arrivedDeckRef.current !== deck) play('dock');
    arrivedDeckRef.current = deck;
  }, [deck, play]);

  return (
    // data-shift drives the operating-cycle ambience (nebula night tint).
    <div className={styles['station-shell']} data-shift={shift}>
      {/* Background layers (decorative, non-interactive) */}
      <div className={styles['station-shell__bg']} aria-hidden="true">
        <NebulaBackdrop />
        {hydrated && (
          <Suspense fallback={null}>
            <Starfield />
          </Suspense>
        )}
        {/* Painted over the starfield: the planet occludes stars, never
            the other way around. */}
        <DeepSpace />
      </div>

      {/* Persistent HUD (does not remount between routes) */}
      <HudFrame />

      {/* Animated route content */}
      <div className={styles['station-shell__content']}>
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<TelemetryLoader />}>
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <RouteTransition key={location.pathname} direction={direction}>
                {outlet}
              </RouteTransition>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </div>

      <NavDock />
      <HullTexture />
      <CommandConsole />
      <StationMap />
      <CustomCursor />

      {/* Boot overlay on first session load */}
      <AnimatePresence>{booting && <BootSequence />}</AnimatePresence>

      <ScrollRestoration />
    </div>
  );
}
