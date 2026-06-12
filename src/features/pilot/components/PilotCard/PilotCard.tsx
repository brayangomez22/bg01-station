import { Panel, Heading, Text, Tag, Button } from '@/components/ui';
import { pilot } from '@/content/pilot';
import styles from './PilotCard.module.css';

export function PilotCard() {
  return (
    <Panel bracketed className={styles['pilot-card']}>
      <img
        className={styles['pilot-card__avatar']}
        src={pilot.avatar.src}
        alt={pilot.avatar.alt}
        width={pilot.avatar.width}
        height={pilot.avatar.height}
        loading="lazy"
      />
      <div className={styles['pilot-card__body']}>
        <Text variant="mono" tone="accent">
          ID: {pilot.callsign}-PR
        </Text>
        <Heading level={2} size="lg">
          {pilot.name}
        </Heading>
        <Text tone="muted">{pilot.role}</Text>
        <dl className={styles['pilot-card__meta']}>
          <div>
            <dt>Ubicación</dt>
            <dd>{pilot.location}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>
              <Tag tone={pilot.available ? 'ok' : 'default'}>
                {pilot.available ? 'Disponible' : 'En misión'}
              </Tag>
            </dd>
          </div>
        </dl>
        <Button href={pilot.resumeUrl} variant="ghost" icon="external">
          Descargar credenciales
        </Button>
      </div>
    </Panel>
  );
}
