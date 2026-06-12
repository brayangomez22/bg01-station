import { useRef } from 'react';
import { motion } from 'motion/react';
import { Container, SectionHeader } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { seoByRoute } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { experience } from '@/content/experience';
import { LogEntry } from './components/LogEntry/LogEntry';
import styles from './LogbookPage.module.css';

export default function LogbookPage() {
  const railRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(railRef);

  const entries = [...experience].sort((a, b) => a.order - b.order);

  return (
    <Container narrow>
      <Seo {...seoByRoute.logbook} path={ROUTES.logbook} />
      <SectionHeader
        eyebrow="MÓDULO 04 · BITÁCORA"
        title="Bitácora de vuelo"
        description="Registro cronológico de la trayectoria profesional del piloto."
        level={1}
      />

      <div className={styles.logbook} ref={railRef}>
        {/* Animated timeline rail drawn as you scroll */}
        <div className={styles.logbook__rail} aria-hidden="true">
          <motion.span
            className={styles['logbook__rail-fill']}
            style={{ scaleY: progress }}
          />
        </div>

        <ol className={styles.logbook__entries} role="list">
          {entries.map((entry, i) => (
            <LogEntry key={entry.id} entry={entry} index={i} />
          ))}
        </ol>
      </div>
    </Container>
  );
}
