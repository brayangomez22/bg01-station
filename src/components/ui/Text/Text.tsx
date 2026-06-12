import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './Text.module.css';

type Variant = 'body' | 'lead' | 'caption' | 'mono';
type Tone = 'default' | 'muted' | 'strong' | 'accent';

interface TextProps {
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  as?: ElementType;
  className?: string;
}

export function Text({
  children,
  variant = 'body',
  tone = 'default',
  as: Tag = 'p',
  className,
}: TextProps) {
  return (
    <Tag
      className={cn(
        styles.text,
        styles[`text--${variant}`],
        styles[`text--${tone}`],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
