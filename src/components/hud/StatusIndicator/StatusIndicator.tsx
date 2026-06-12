import { cn } from '@/lib/cn';
import styles from './StatusIndicator.module.css';

interface StatusIndicatorProps {
  label: string;
  state?: 'online' | 'warn' | 'offline';
}

/** Station status pill, e.g. "BG-01 · ONLINE". */
export function StatusIndicator({ label, state = 'online' }: StatusIndicatorProps) {
  return (
    <div className={cn(styles['status-indicator'], styles[`status-indicator--${state}`])}>
      <span className={styles['status-indicator__dot']} aria-hidden="true" />
      <span className={styles['status-indicator__label']}>{label}</span>
    </div>
  );
}
