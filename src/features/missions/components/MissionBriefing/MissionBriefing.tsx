import { motion } from 'motion/react';
import { Heading, Text, Tag, Button, Panel } from '@/components/ui';
import { Reveal } from '@/components/fx/Reveal/Reveal';
import { ROUTES } from '@/app/router/paths';
import { technologyById } from '@/content/technologies';
import { formatMonthYear } from '@/lib/format';
import { fadeInUp, staggerContainer } from '@/lib/motion/variants';
import type { Mission, MissionStatus } from '@/types/domain';
import styles from './MissionBriefing.module.css';

const STATUS: Record<MissionStatus, { label: string; tone: 'ok' | 'warn' | 'default' }> =
  {
    completed: { label: 'Completada', tone: 'ok' },
    'in-progress': { label: 'En curso', tone: 'warn' },
    classified: { label: 'Clasificada', tone: 'default' },
  };

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <section className={styles['mission-briefing__block']}>
      <Text variant="mono" tone="accent">
        ▸ {title}
      </Text>
      <ul role="list" className={styles['mission-briefing__list']}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function MissionBriefing({ mission }: { mission: Mission }) {
  const status = STATUS[mission.status];

  return (
    <article className={styles['mission-briefing']}>
      <Button to={ROUTES.missions} variant="ghost" size="sm" icon="arrow-left">
        Volver al registro
      </Button>

      <motion.header
        className={styles['mission-briefing__head']}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} className={styles['mission-briefing__meta']}>
          <Text variant="mono" tone="accent">
            {mission.code}
          </Text>
          <Tag tone={status.tone}>{status.label}</Tag>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Heading level={1} size="2xl">
            {mission.title}
          </Heading>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Text variant="lead" tone="muted">
            {mission.summary}
          </Text>
        </motion.div>
      </motion.header>

      <Reveal>
        <img
          className={styles['mission-briefing__cover']}
          src={mission.cover.src}
          alt={mission.cover.alt}
          width={mission.cover.width}
          height={mission.cover.height}
        />
      </Reveal>

      <dl className={styles['mission-briefing__facts']}>
        <div>
          <dt>Rol</dt>
          <dd>{mission.role}</dd>
        </div>
        <div>
          <dt>Duración</dt>
          <dd>{mission.durationLabel}</dd>
        </div>
        <div>
          <dt>Inicio</dt>
          <dd>{formatMonthYear(mission.period.start)}</dd>
        </div>
      </dl>

      <Reveal>
        <Text>{mission.description}</Text>
      </Reveal>

      <div className={styles['mission-briefing__columns']}>
        <List title="Logros clave" items={mission.highlights} />
        <List title="Desafíos" items={mission.challenges} />
      </div>

      {mission.metrics && mission.metrics.length > 0 && (
        <ul className={styles['mission-briefing__metrics']} role="list">
          {mission.metrics.map((m) => (
            <li key={m.label}>
              <Panel className={styles['mission-briefing__metric']}>
                <Heading
                  level={3}
                  size="lg"
                  className={styles['mission-briefing__metric-value']}
                >
                  {m.value}
                </Heading>
                <Text variant="mono" tone="muted">
                  {m.label}
                </Text>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <section className={styles['mission-briefing__block']}>
        <Text variant="mono" tone="accent">
          ▸ STACK DESPLEGADO
        </Text>
        <ul className={styles['mission-briefing__stack']} role="list">
          {mission.technologies.map((id) => {
            const tech = technologyById(id);
            return tech ? (
              <li key={id}>
                <Tag>{tech.name}</Tag>
              </li>
            ) : null;
          })}
        </ul>
      </section>

      <div className={styles['mission-briefing__actions']}>
        {mission.links.live && (
          <Button href={mission.links.live} variant="primary" iconRight="external">
            Ver en órbita
          </Button>
        )}
        {mission.links.repo && (
          <Button href={mission.links.repo} variant="ghost" icon="github">
            Código fuente
          </Button>
        )}
      </div>
    </article>
  );
}
