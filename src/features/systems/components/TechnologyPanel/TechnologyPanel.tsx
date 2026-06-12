import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Panel, Heading, Text, Tag } from '@/components/ui';
import { ROUTES } from '@/app/router/paths';
import { yearOf } from '@/lib/format';
import type { Technology, Mission } from '@/types/domain';
import { ProficiencyMeter } from '../ProficiencyMeter/ProficiencyMeter';
import styles from './TechnologyPanel.module.css';

interface TechnologyPanelProps {
  tech: Technology;
  missions: Mission[];
}

const CATEGORY_LABEL: Record<Technology['category'], string> = {
  language: 'Lenguaje',
  framework: 'Framework',
  database: 'Base de datos',
  cloud: 'Cloud',
  tooling: 'Herramienta',
};

export function TechnologyPanel({ tech, missions }: TechnologyPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tech.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <Panel bracketed className={styles['technology-panel']}>
          <div className={styles['technology-panel__head']}>
            <Tag tone="accent">{CATEGORY_LABEL[tech.category]}</Tag>
            <Text variant="mono" tone="muted">
              DESDE {yearOf(tech.since)} · STATUS:{' '}
              <Text as="span" variant="mono" tone="accent">
                GO
              </Text>
            </Text>
          </div>

          <Heading level={3} size="lg">
            {tech.name}
          </Heading>
          <Text tone="muted">{tech.description}</Text>

          <ProficiencyMeter value={tech.proficiency} />

          <div className={styles['technology-panel__missions']}>
            <Text variant="mono" tone="accent">
              MISIONES VINCULADAS · {missions.length}
            </Text>
            {missions.length > 0 ? (
              <ul role="list" className={styles['technology-panel__list']}>
                {missions.map((m) => (
                  <li key={m.id}>
                    <Link
                      to={ROUTES.missionDetail(m.id)}
                      className={styles['technology-panel__mission']}
                    >
                      <span>{m.code}</span> {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Text variant="caption" tone="muted">
                Sin misiones registradas todavía.
              </Text>
            )}
          </div>
        </Panel>
      </motion.div>
    </AnimatePresence>
  );
}
