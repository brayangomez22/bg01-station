import { useMemo, useState } from 'react';
import type { Mission } from '@/types/domain';

export interface MissionFilterOption {
  id: string;
  label: string;
}

/**
 * Filters missions by technology id. "all" shows everything.
 * Filter options are derived from the technologies actually used.
 */
export function useMissionFilters(
  missions: Mission[],
  optionLabel: (techId: string) => string,
) {
  const [active, setActive] = useState<string>('all');

  const options = useMemo<MissionFilterOption[]>(() => {
    const ids = new Set<string>();
    missions.forEach((m) => m.technologies.forEach((t) => ids.add(t)));
    return [
      { id: 'all', label: 'Todas' },
      ...[...ids].map((id) => ({ id, label: optionLabel(id) })),
    ];
  }, [missions, optionLabel]);

  const filtered = useMemo(() => {
    const list =
      active === 'all'
        ? missions
        : missions.filter((m) => m.technologies.includes(active));
    return [...list].sort((a, b) => a.order - b.order);
  }, [missions, active]);

  return { active, setActive, options, filtered };
}
