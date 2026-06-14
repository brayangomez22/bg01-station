import { motion } from 'motion/react';
import { Heading, Icon, TelemetryLine, Text } from '@/components/ui';
import { trainingLog, trainingSims } from '@/content/training';
import { fadeInUp, staggerContainer } from '@/lib/motion/variants';
import type { TrainingSim } from '@/types/domain';
import styles from './TrainingLog.module.css';

function SimCard({ sim }: { sim: TrainingSim }) {
  return (
    <motion.li variants={fadeInUp} className={styles['training-log__item']}>
      <a
        href={sim.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles['training-log__card']}
        aria-label={`Abrir simulación ${sim.code} (${sim.repo}) en GitHub`}
      >
        <span className={styles['training-log__card-head']}>
          <span className={styles['training-log__code']}>
            {sim.code} · {sim.repo}
          </span>
          <Icon name="external" size={14} className={styles['training-log__ext']} />
        </span>
        <Heading level={3} size="md">
          {sim.title}
        </Heading>
        <Text variant="caption" tone="muted">
          {sim.summary}
        </Text>
        <ul className={styles['training-log__stack']} role="list">
          {sim.stack.map((label) => (
            <li key={label} className={styles['training-log__chip']}>
              {label}
            </li>
          ))}
        </ul>
      </a>
    </motion.li>
  );
}

/**
 * Training annex at the end of the missions deck: curated practice repos
 * (simulator hours), kept visually subordinate to the real missions above.
 */
export function TrainingLog() {
  return (
    <section className={styles['training-log']} aria-labelledby="training-log-title">
      <motion.header
        className={styles['training-log__header']}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      >
        <motion.div variants={fadeInUp}>
          <Text variant="mono" tone="accent">
            MÓDULO 03 · ANEXO
          </Text>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Heading id="training-log-title" level={2} size="lg">
            Registro de entrenamiento
          </Heading>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Text tone="muted">
            Prácticas y laboratorios técnicos: simulaciones donde se prueban lenguajes,
            patrones y arquitecturas antes de aplicarlos en misiones reales.
          </Text>
        </motion.div>
      </motion.header>

      <TelemetryLine>
        {trainingLog.totalSims} simulaciones registradas desde {trainingLog.sinceYear} ·{' '}
        <a
          href={trainingLog.hangarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles['training-log__hangar-link']}
        >
          ver hangar completo en GitHub
        </a>
      </TelemetryLine>

      <motion.ul
        className={styles['training-log__grid']}
        role="list"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      >
        {trainingSims.map((sim) => (
          <SimCard key={sim.repo} sim={sim} />
        ))}
      </motion.ul>
    </section>
  );
}
