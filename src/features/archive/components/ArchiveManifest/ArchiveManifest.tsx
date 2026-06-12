import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ROUTES } from '@/app/router/paths';
import { sectionById } from '@/content/archive/manifest';
import { formatStamp } from '@/lib/format';
import { fadeInUp, staggerContainer } from '@/lib/motion/variants';
import type { ArchiveMeta } from '@/types/domain';
import styles from './ArchiveManifest.module.css';

interface ArchiveManifestProps {
  records: ArchiveMeta[];
}

/** Inventory-style record listing: dense rows, ID first, title loudest. */
export function ArchiveManifest({ records }: ArchiveManifestProps) {
  if (records.length === 0) return null;

  return (
    <motion.ol
      className={styles.manifest}
      role="list"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {records.map((r) => {
        const section = sectionById(r.section);
        return (
          <motion.li key={r.id} variants={fadeInUp}>
            <Link to={ROUTES.archiveRecord(r.id)} className={styles.manifest__row}>
              <span className={styles.manifest__code}>{r.code}</span>
              <span className={styles.manifest__title}>{r.title}</span>
              <span className={styles.manifest__section} title={section.label}>
                {section.code}
              </span>
              <span className={styles.manifest__date}>{formatStamp(r.archivedAt)}</span>
              <span className={styles.manifest__minutes}>{r.readingMinutes} MIN</span>
              <span className={styles.manifest__go} aria-hidden="true">
                ►
              </span>
            </Link>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
