import { Panel, Heading, Text } from '@/components/ui';
import { Reveal } from '@/components/fx/Reveal/Reveal';
import { pilot } from '@/content/pilot';
import styles from './PilotStats.module.css';

export function PilotStats() {
  return (
    <ul className={styles['pilot-stats']} role="list">
      {pilot.stats.map((stat, i) => (
        <li key={stat.label}>
          <Reveal delay={i * 0.08}>
            <Panel className={styles['pilot-stats__item']}>
              <Heading level={3} size="2xl" className={styles['pilot-stats__value']}>
                {stat.value}
              </Heading>
              <Text variant="mono" tone="muted">
                {stat.label}
              </Text>
            </Panel>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
