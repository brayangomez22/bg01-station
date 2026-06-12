import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  /** Narrow column for reading-heavy sections. */
  narrow?: boolean;
  as?: ElementType;
  className?: string;
}

export function Container({
  children,
  narrow = false,
  as: Tag = 'div',
  className,
}: ContainerProps) {
  return (
    <Tag
      className={cn(styles.container, narrow && styles['container--narrow'], className)}
    >
      {children}
    </Tag>
  );
}
