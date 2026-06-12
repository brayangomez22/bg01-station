import { useCallback, useMemo, useState } from 'react';
import { TelemetryLine } from '@/components/ui';
import { useBreakpointUp } from '@/hooks/useMediaQuery';
import { useSound } from '@/app/providers/SoundProvider';
import type { Technology, Mission } from '@/types/domain';
import { TechnologyItem } from '../TechnologyItem/TechnologyItem';
import { TechnologyPanel } from '../TechnologyPanel/TechnologyPanel';
import styles from './SystemView.module.css';

interface SystemViewProps {
  technologies: Technology[];
  missions: Mission[];
}

/** Ring radii as % of the (square) orbit container, matching the drawn rings. */
const RING_RADIUS: Record<number, number> = { 1: 20, 2: 32.5, 3: 45 };

/** Clamp data orbits (1–4) onto the three drawn rings. */
const ringOf = (orbit: number) => Math.min(Math.max(orbit, 1), 3);

interface PolarPosition {
  left: string;
  top: string;
}

/** Distribute each ring's planets evenly, with a stagger so rings interleave. */
function polarPositions(technologies: Technology[]): Map<string, PolarPosition> {
  const byRing = new Map<number, Technology[]>();
  for (const tech of technologies) {
    const ring = ringOf(tech.planet.orbit);
    byRing.set(ring, [...(byRing.get(ring) ?? []), tech]);
  }

  const positions = new Map<string, PolarPosition>();
  for (const [ring, group] of byRing) {
    const radius = RING_RADIUS[ring];
    group.forEach((tech, i) => {
      const angle = ((360 / group.length) * i + ring * 48 - 90) * (Math.PI / 180);
      positions.set(tech.id, {
        left: `${50 + radius * Math.cos(angle)}%`,
        top: `${50 + radius * Math.sin(angle)}%`,
      });
    });
  }
  return positions;
}

/**
 * Orbital system. On desktop the planets sit *on* their orbit rings in a
 * slowly counter-rotating radial layout (paused on hover/focus and under
 * reduced motion); below `md` it falls back to the wrap grid. Selection
 * logic is shared by both layouts.
 */
export function SystemView({ technologies, missions }: SystemViewProps) {
  const orbital = useBreakpointUp('md');
  const { play } = useSound();

  const sorted = useMemo(
    () => [...technologies].sort((a, b) => a.order - b.order),
    [technologies],
  );
  const [selectedId, setSelectedId] = useState(sorted[0]?.id ?? '');

  const select = useCallback(
    (id: string) => {
      setSelectedId(id);
      play('select');
    },
    [play],
  );

  const selected = sorted.find((t) => t.id === selectedId) ?? sorted[0];

  const linkedMissions = useMemo(
    () => missions.filter((m) => m.technologies.includes(selected.id)),
    [missions, selected.id],
  );

  const positions = useMemo(() => polarPositions(sorted), [sorted]);

  return (
    <div className={styles['system-view']}>
      <div>
        <div className={styles['system-view__orbit']} data-orbital={orbital || undefined}>
          <span
            className={styles['system-view__ring']}
            data-ring="1"
            aria-hidden="true"
          />
          <span
            className={styles['system-view__ring']}
            data-ring="2"
            aria-hidden="true"
          />
          <span
            className={styles['system-view__ring']}
            data-ring="3"
            aria-hidden="true"
          />
          <span className={styles['system-view__sun']} aria-hidden="true" />

          {orbital ? (
            <ul className={styles['system-view__carousel']} role="list">
              {sorted.map((tech) => (
                <li
                  key={tech.id}
                  className={styles['system-view__slot']}
                  style={positions.get(tech.id)}
                >
                  <span className={styles['system-view__counter']}>
                    <TechnologyItem
                      tech={tech}
                      selected={tech.id === selected.id}
                      onSelect={select}
                    />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className={styles['system-view__planets']} role="list">
              {sorted.map((tech) => (
                <li key={tech.id}>
                  <TechnologyItem
                    tech={tech}
                    selected={tech.id === selected.id}
                    onSelect={select}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <TelemetryLine live tone="accent" key={selected.id}>
          sistema seleccionado: {selected.name} · status: GO
        </TelemetryLine>
      </div>

      <div className={styles['system-view__detail']}>
        <TechnologyPanel tech={selected} missions={linkedMissions} />
      </div>
    </div>
  );
}
