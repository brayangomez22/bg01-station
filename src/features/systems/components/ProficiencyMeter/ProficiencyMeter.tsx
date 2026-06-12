import { motion } from 'motion/react';
import styles from './ProficiencyMeter.module.css';

interface ProficiencyMeterProps {
  value: number; // 0-100
  label?: string;
}

export function ProficiencyMeter({ value, label = 'Dominio' }: ProficiencyMeterProps) {
  return (
    <div className={styles['proficiency-meter']}>
      <div className={styles['proficiency-meter__head']}>
        <span className={styles['proficiency-meter__label']}>{label}</span>
        <span className={styles['proficiency-meter__value']}>{value}%</span>
      </div>
      <div
        className={styles['proficiency-meter__track']}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.span
          className={styles['proficiency-meter__fill']}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: value / 100 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
