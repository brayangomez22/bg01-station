import { useEffect, useState } from 'react';

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

/** Current shift, re-evaluated once per minute (state only changes at shift
    boundaries, so consumers re-render at most three times a day). */
export function useStationShift(): StationShift {
  const [shift, setShift] = useState<StationShift>(() =>
    shiftForHour(new Date().getHours()),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setShift(shiftForHour(new Date().getHours()));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return shift;
}
