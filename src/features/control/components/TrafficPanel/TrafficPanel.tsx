import { useEffect, useState } from 'react';
import { Heading, Panel, Text } from '@/components/ui';
import { getStats, type VisitStats } from '@/lib/control/stats';
import styles from './TrafficPanel.module.css';

/** Spanish weekday initials, Sunday-first (X for Miércoles to disambiguate). */
const WEEKDAY = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const;

/** Weekday initial for a 'YYYY-MM-DD' day, parsed as a local calendar date. */
function weekday(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return WEEKDAY[new Date(y, m - 1, d).getDay()];
}

type State =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; stats: VisitStats };

/**
 * Station traffic readout for the control dashboard: today / yesterday / 7-day /
 * total unique visitors, plus a 7-day mini bar chart. Reads /admin/stats.
 */
export function TrafficPanel() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    getStats()
      .then((stats) => alive && setState({ kind: 'ready', stats }))
      .catch(() => alive && setState({ kind: 'error' }));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Panel bracketed className={styles.traffic}>
      <header className={styles.traffic__head}>
        <Heading level={2} size="md">
          Tráfico de la estación
        </Heading>
        <Text tone="muted" variant="caption">
          Visitantes únicos · sin cookies ni rastreo
        </Text>
      </header>

      {state.kind === 'loading' && (
        <Text tone="muted" variant="mono">
          Sincronizando telemetría…
        </Text>
      )}

      {state.kind === 'error' && (
        <Text tone="muted" variant="mono">
          Sin señal del API. Inicia sesión de nuevo o revisa que la estación esté en
          línea.
        </Text>
      )}

      {state.kind === 'ready' && <Readout stats={state.stats} />}
    </Panel>
  );
}

function Readout({ stats }: { stats: VisitStats }) {
  const max = Math.max(1, ...stats.series.map((d) => d.count));

  return (
    <>
      <dl className={styles.traffic__figures}>
        <Figure label="Hoy" value={stats.today} accent />
        <Figure label="Ayer" value={stats.yesterday} />
        <Figure label="7 días" value={stats.week} />
        <Figure label="Total" value={stats.total} />
      </dl>

      <div className={styles.traffic__chart} role="img" aria-label="Visitantes por día, últimos 7 días">
        {stats.series.map((d, i) => {
          const isToday = i === stats.series.length - 1;
          return (
            <div key={d.day} className={styles.traffic__bar}>
              <span className={styles['traffic__bar-count']}>{d.count}</span>
              <div className={styles['traffic__bar-track']}>
                <div
                  className={
                    isToday
                      ? `${styles['traffic__bar-fill']} ${styles['traffic__bar-fill--today']}`
                      : styles['traffic__bar-fill']
                  }
                  style={{ height: `${(d.count / max) * 100}%` }}
                  title={`${d.day}: ${d.count}`}
                />
              </div>
              <span className={styles['traffic__bar-label']}>{weekday(d.day)}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Figure({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={styles.traffic__figure}>
      <dt className={styles['traffic__figure-label']}>{label}</dt>
      <dd
        className={
          accent
            ? `${styles['traffic__figure-value']} ${styles['traffic__figure-value--accent']}`
            : styles['traffic__figure-value']
        }
      >
        {value}
      </dd>
    </div>
  );
}
