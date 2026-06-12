import { motion } from 'motion/react';
import type { Technology } from '@/types/domain';
import { cn } from '@/lib/cn';
import styles from './TechnologyItem.module.css';

interface TechnologyItemProps {
  tech: Technology;
  selected: boolean;
  onSelect: (id: string) => void;
}

/** A "planet" — selectable orbital body representing a technology. */
export function TechnologyItem({ tech, selected, onSelect }: TechnologyItemProps) {
  return (
    <motion.button
      type="button"
      className={cn(
        styles['technology-item'],
        selected && styles['technology-item--selected'],
      )}
      data-size={tech.planet.size}
      style={{ ['--planet-color' as string]: `var(${tech.planet.color})` }}
      onClick={() => onSelect(tech.id)}
      aria-pressed={selected}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className={styles['technology-item__body']} aria-hidden="true" />
      <span className={styles['technology-item__name']}>{tech.name}</span>
    </motion.button>
  );
}
