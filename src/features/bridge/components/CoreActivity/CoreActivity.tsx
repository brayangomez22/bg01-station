import { useEffect, useState } from 'react';
import { TelemetryLine } from '@/components/ui';
import styles from './CoreActivity.module.css';

const GITHUB_USER = 'brayangomez22';
const CACHE_KEY = 'bg01:core-activity:v2';
const CACHE_TTL_MS = 10 * 60 * 1000;

/** Recent public event, or profile-level stats when the event feed is
    quiet (the events API only covers ~90 days; a stale push date would
    read worse than no date at all). */
type Telemetry =
  | { kind: 'event'; repo: string; type: string; at: string }
  | { kind: 'profile'; repos: number };

const EVENT_LABEL: Record<string, string> = {
  PushEvent: 'push a',
  CreateEvent: 'creación en',
  PullRequestEvent: 'pull request en',
  IssuesEvent: 'issue en',
  WatchEvent: 'actividad en',
  ForkEvent: 'fork de',
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `hace ${Math.max(mins, 1)} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

/**
 * Live core telemetry: the latest public GitHub event, cached in
 * sessionStorage. A failed fetch degrades diegetically ("telemetría
 * diferida") instead of erroring.
 */
export function CoreActivity() {
  const [telemetry, setTelemetry] = useState<Telemetry | null | 'pending'>('pending');

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, at } = JSON.parse(cached) as { data: Telemetry; at: number };
        if (Date.now() - at < CACHE_TTL_MS) {
          setTelemetry(data);
          return;
        }
      } catch {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }

    const controller = new AbortController();
    const headers = { Accept: 'application/vnd.github+json' };
    const getJson = (url: string) =>
      fetch(url, { signal: controller.signal, headers }).then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(String(res.status))),
      );

    (async (): Promise<Telemetry | null> => {
      const events = (await getJson(
        `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=5`,
      )) as Array<{ type: string; repo: { name: string }; created_at: string }>;
      const ev = events.find((e) => e.type in EVENT_LABEL) ?? events[0];
      if (ev) {
        return { kind: 'event', repo: ev.repo.name, type: ev.type, at: ev.created_at };
      }
      const user = (await getJson(`https://api.github.com/users/${GITHUB_USER}`)) as {
        public_repos?: number;
      };
      return typeof user.public_repos === 'number'
        ? { kind: 'profile', repos: user.public_repos }
        : null;
    })()
      .then((data) => {
        if (data) {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, at: Date.now() }));
        }
        setTelemetry(data);
      })
      .catch(() => setTelemetry(null));

    return () => controller.abort();
  }, []);

  return (
    <div className={styles['core-activity']}>
      {telemetry === 'pending' ? (
        <TelemetryLine>consultando telemetría del núcleo…</TelemetryLine>
      ) : telemetry === null ? (
        <TelemetryLine>telemetría diferida · canal github fuera de alcance</TelemetryLine>
      ) : telemetry.kind === 'event' ? (
        <TelemetryLine tone="accent" live>
          última actividad del núcleo · {EVENT_LABEL[telemetry.type] ?? 'actividad en'}{' '}
          <a
            className={styles['core-activity__repo']}
            href={`https://github.com/${telemetry.repo}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {telemetry.repo}
          </a>{' '}
          · {relativeTime(telemetry.at)}
        </TelemetryLine>
      ) : (
        <TelemetryLine tone="accent" live>
          canal github operativo ·{' '}
          <a
            className={styles['core-activity__repo']}
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{GITHUB_USER}
          </a>{' '}
          · {telemetry.repos} repos públicos
        </TelemetryLine>
      )}
    </div>
  );
}
