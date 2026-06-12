import { motion } from 'motion/react';
import { Text } from '@/components/ui';
import { staggerContainer } from '@/lib/motion/variants';
import type { Mission } from '@/types/domain';
import { MissionCard } from '../MissionCard/MissionCard';
import styles from './MissionGrid.module.css';

export function MissionGrid({ missions }: { missions: Mission[] }) {
  if (missions.length === 0) {
    return (
      <div className={styles['mission-grid__empty']}>
        <Text variant="mono" tone="muted">
          Sin misiones para este filtro.
        </Text>
      </div>
    );
  }

  return (
    <motion.ul
      className={styles['mission-grid']}
      role="list"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {missions.map((mission) => (
        <li key={mission.id} className={styles['mission-grid__item']}>
          <MissionCard mission={mission} />
        </li>
      ))}
    </motion.ul>
  );
}
