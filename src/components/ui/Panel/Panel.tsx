import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './Panel.module.css';

interface PanelProps {
  children: ReactNode;
  /** Visual elevation. `drawer` is more opaque & blurred. */
  elevation?: 'panel' | 'drawer';
  /** Adds HUD corner brackets. */
  bracketed?: boolean;
  as?: ElementType;
  className?: string;
}

export function Panel({
  children,
  elevation = 'panel',
  bracketed = false,
  as: Tag = 'div',
  className,
}: PanelProps) {
  return (
    <Tag
      className={cn(
        styles.panel,
        styles[`panel--${elevation}`],
        bracketed && styles['panel--bracketed'],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
