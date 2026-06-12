import { Panel, Heading, Text, Tag } from '@/components/ui';
import { Reveal } from '@/components/fx/Reveal/Reveal';
import { technologyById } from '@/content/technologies';
import { formatPeriod } from '@/lib/format';
import type { Experience } from '@/types/domain';
import styles from './LogEntry.module.css';

export function LogEntry({ entry, index }: { entry: Experience; index: number }) {
  return (
    <li className={styles['log-entry']}>
      <span className={styles['log-entry__node']} aria-hidden="true" />
      <Reveal delay={index * 0.05} className={styles['log-entry__reveal']}>
        <Panel className={styles['log-entry__panel']}>
          <Text variant="mono" tone="accent">
            {formatPeriod(entry.period.start, entry.period.end)}
          </Text>
          <Heading level={3} size="md">
            {entry.role}
          </Heading>
          <Text tone="muted">
            {entry.company} · {entry.location}
          </Text>
          <Text>{entry.summary}</Text>

          <ul role="list" className={styles['log-entry__points']}>
            {entry.achievements.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>

          <ul role="list" className={styles['log-entry__stack']}>
            {entry.technologies.map((id) => {
              const tech = technologyById(id);
              return tech ? (
                <li key={id}>
                  <Tag>{tech.name}</Tag>
                </li>
              ) : null;
            })}
          </ul>
        </Panel>
      </Reveal>
    </li>
  );
}
