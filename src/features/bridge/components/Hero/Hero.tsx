import { motion } from 'motion/react';
import { Button, Heading, Text } from '@/components/ui';
import { ROUTES } from '@/app/router/paths';
import { pilot } from '@/content/pilot';
import { technologies } from '@/content/technologies';
import { staggerContainer, fadeInUp, revealMask } from '@/lib/motion/variants';
import { EvaScan } from '../EvaScan/EvaScan';
import styles from './Hero.module.css';

const STACK = technologies
  .filter((t) => t.featured)
  .sort((a, b) => a.order - b.order)
  .slice(0, 5);

export function Hero() {
  return (
    <motion.section
      className={styles.hero}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      aria-labelledby="hero-title"
    >
      <div className={styles.hero__main}>
        <motion.div variants={fadeInUp}>
          <Text variant="mono" tone="accent">
            ▸ CONEXIÓN ESTABLECIDA CON {pilot.callsign}
          </Text>
        </motion.div>

        <div className={styles.hero__title}>
          <motion.div variants={revealMask}>
            <Heading id="hero-title" level={1} size="hero">
              {pilot.name}
            </Heading>
          </motion.div>
        </div>

        <motion.div variants={fadeInUp}>
          <p className={styles.hero__role}>{pilot.role}</p>
        </motion.div>

        <motion.ul variants={fadeInUp} className={styles.hero__stack} role="list">
          {STACK.map((tech) => (
            <li key={tech.id} className={styles['hero__stack-chip']}>
              {tech.name}
            </li>
          ))}
        </motion.ul>

        <motion.div variants={fadeInUp}>
          <Text className={styles.hero__bio}>{pilot.bio}</Text>
        </motion.div>

        <motion.div variants={fadeInUp} className={styles.hero__actions}>
          <Button to={ROUTES.missions} variant="hud" iconRight="arrow-right">
            Ver misiones
          </Button>
          <Button href={pilot.resumeUrl} variant="ghost">
            Descargar CV
          </Button>
        </motion.div>
      </div>

      <motion.div variants={fadeInUp} className={styles.hero__side}>
        <EvaScan />
      </motion.div>
    </motion.section>
  );
}
