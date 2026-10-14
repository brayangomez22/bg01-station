import { useSyncExternalStore } from 'react';

/**
 * Station operating shift, derived from the visitor's local hour. The
 * station keeps the visitor's clock: alfa 06–14, beta 14–22, nocturno 22–06.
 */
export type StationShift = 'alfa' | 'beta' | 'nocturno';

export function shiftForHour(hour: number): StationShift {
  if (hour >= 6 && hour < 14) return 'alfa';
  if (hour >= 14 && hour < 22) return 'beta';
  return 'nocturno';
}

/** Re-evaluated once per minute (the snapshot only changes at shift
    boundaries, so consumers re-render at most three times a day). */
const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
};

const currentShift = () => shiftForHour(new Date().getHours());

/** Current shift. The prerender has no visitor clock and reports 'alfa';
    hydration then switches to the visitor's real shift. */
export function useStationShift(): StationShift {
  return useSyncExternalStore(subscribe, currentShift, () => 'alfa');
}
