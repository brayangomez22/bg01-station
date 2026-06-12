import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heading, Panel, Text } from '@/components/ui';
import { ROUTES } from '@/app/router/paths';
import { prefetchRoute } from '@/app/router/prefetch';
import { sectionById } from '@/content/archive/manifest';
import { formatStamp } from '@/lib/format';
import { fadeInUp } from '@/lib/motion/variants';
import type { ArchiveMeta } from '@/types/domain';
import styles from './FeaturedRecord.module.css';

interface FeaturedRecordProps {
  record: ArchiveMeta;
}

/** The newest record, promoted above the manifest rows. */
export function FeaturedRecord({ record }: FeaturedRecordProps) {
  const section = sectionById(record.section);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Link
        to={ROUTES.archiveRecord(record.id)}
        className={styles.featured}
        onMouseEnter={() => prefetchRoute(ROUTES.archive)}
      >
        <Panel bracketed className={styles.featured__panel}>
          <div className={styles.featured__meta}>
            <Text variant="mono" tone="accent" as="span">
              ÚLTIMO REGISTRO · {record.code} · {section.code}
            </Text>
            <Text variant="mono" tone="muted" as="span">
              ARCHIVADO {formatStamp(record.archivedAt)} · {record.readingMinutes} MIN
            </Text>
          </div>
          <Heading level={2} size="lg">
            {record.title}
          </Heading>
          <Text tone="muted" className={styles.featured__abstract}>
            {record.abstract}
          </Text>
          <span className={styles.featured__cta} aria-hidden="true">
            [ RECUPERAR ► ]
          </span>
        </Panel>
      </Link>
    </motion.div>
  );
}
