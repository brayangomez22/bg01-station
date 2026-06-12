import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heading, Text, Tag } from '@/components/ui';
import { ROUTES } from '@/app/router/paths';
import { prefetchRoute } from '@/app/router/prefetch';
import { technologyById } from '@/content/technologies';
import { fadeInUp } from '@/lib/motion/variants';
import type { Mission, MissionStatus } from '@/types/domain';
import styles from './MissionCard.module.css';

const STATUS: Record<MissionStatus, { label: string; tone: 'ok' | 'warn' | 'default' }> =
  {
    completed: { label: 'Completada', tone: 'ok' },
    'in-progress': { label: 'En curso', tone: 'warn' },
    classified: { label: 'Clasificada', tone: 'default' },
  };

export function MissionCard({ mission }: { mission: Mission }) {
  const status = STATUS[mission.status];

  return (
    <motion.article variants={fadeInUp} className={styles['mission-card']}>
      <Link
        to={ROUTES.missionDetail(mission.id)}
        className={styles['mission-card__link']}
        onMouseEnter={() => prefetchRoute(ROUTES.missions)}
        aria-label={`Abrir misión ${mission.code}: ${mission.title}`}
      >
        <div className={styles['mission-card__media']}>
          <img
            src={mission.cover.src}
            alt={mission.cover.alt}
            width={mission.cover.width}
            height={mission.cover.height}
            loading="lazy"
            className={styles['mission-card__img']}
          />
          <span className={styles['mission-card__code']}>{mission.code}</span>
        </div>

        <span
          className={styles['mission-card__bracket']}
          data-pos="tl"
          aria-hidden="true"
        />
        <span
          className={styles['mission-card__bracket']}
          data-pos="tr"
          aria-hidden="true"
        />
        <span
          className={styles['mission-card__bracket']}
          data-pos="bl"
          aria-hidden="true"
        />
        <span
          className={styles['mission-card__bracket']}
          data-pos="br"
          aria-hidden="true"
        />

        <div className={styles['mission-card__body']}>
          <Tag tone={status.tone}>{status.label}</Tag>
          <Heading level={3} size="md">
            {mission.title}
          </Heading>
          <span className={styles['mission-card__lock']} aria-hidden="true">
            &gt; objetivo fijado · {mission.code}
          </span>
          <Text variant="caption" tone="muted">
            {mission.summary}
          </Text>
          <ul className={styles['mission-card__stack']} role="list">
            {mission.technologies.map((id) => {
              const tech = technologyById(id);
              return tech ? (
                <li key={id} className={styles['mission-card__chip']}>
                  {tech.name}
                </li>
              ) : null;
            })}
          </ul>
        </div>
      </Link>
    </motion.article>
  );
}
