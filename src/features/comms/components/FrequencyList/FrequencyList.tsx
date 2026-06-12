import { Icon, Text } from '@/components/ui';
import { frequencies } from '@/content/socials';
import styles from './FrequencyList.module.css';

export function FrequencyList() {
  return (
    <ul className={styles['frequency-list']} role="list">
      {frequencies.map((freq) => (
        <li key={freq.id}>
          <a
            href={freq.url}
            className={styles['frequency-list__item']}
            target={freq.id === 'email' ? undefined : '_blank'}
            rel={freq.id === 'email' ? undefined : 'noopener noreferrer'}
            data-primary={freq.primary || undefined}
          >
            <span className={styles['frequency-list__icon']}>
              <Icon name={freq.icon} size={22} />
            </span>
            <span className={styles['frequency-list__text']}>
              <Text variant="mono" tone="muted">
                {freq.label}
              </Text>
              <Text tone="strong">{freq.handle}</Text>
            </span>
            <Icon name="external" size={16} />
          </a>
        </li>
      ))}
    </ul>
  );
}
