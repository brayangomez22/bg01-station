import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './Tag.module.css';

type TagTone = 'default' | 'accent' | 'ok' | 'warn' | 'danger';

interface TagProps {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
}

export function Tag({ children, tone = 'default', className }: TagProps) {
  return (
    <span className={cn(styles.tag, styles[`tag--${tone}`], className)}>{children}</span>
  );
}
