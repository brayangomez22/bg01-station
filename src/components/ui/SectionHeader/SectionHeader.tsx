import { motion } from 'motion/react';
import { Heading } from '@/components/ui/Heading/Heading';
import { Text } from '@/components/ui/Text/Text';
import { fadeInUp, staggerContainer } from '@/lib/motion/variants';
import { cn } from '@/lib/cn';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  /** Mono kicker, e.g. "MÓDULO 03 · SISTEMAS". */
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'start' | 'center';
  /** Semantic heading level for this section. */
  level?: 1 | 2 | 3;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'start',
  level = 2,
}: SectionHeaderProps) {
  return (
    <motion.header
      className={cn(styles['section-header'], styles[`section-header--${align}`])}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
    >
      <motion.div variants={fadeInUp}>
        <Text variant="mono" tone="accent">
          {eyebrow}
        </Text>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <Heading level={level} size="2xl">
          {title}
        </Heading>
      </motion.div>
      {description && (
        <motion.div variants={fadeInUp} className={styles['section-header__desc']}>
          <Text variant="lead" tone="muted">
            {description}
          </Text>
        </motion.div>
      )}
    </motion.header>
  );
}
