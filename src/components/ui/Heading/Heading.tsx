import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './Heading.module.css';

type Level = 1 | 2 | 3 | 4;
type Size = 'hero' | '2xl' | 'xl' | 'lg' | 'md';

interface HeadingProps {
  children: ReactNode;
  /** Semantic level (h1-h4). Decoupled from visual size. */
  level?: Level;
  /** Render as a paragraph: heading styling for content that isn't a section
      title (e.g. a stat value), so it stays out of the heading outline. */
  as?: 'p';
  size?: Size;
  className?: string;
  id?: string;
}

export function Heading({
  children,
  level = 2,
  as,
  size = 'xl',
  className,
  id,
}: HeadingProps) {
  const Tag = as ?? (`h${level}` as const);
  return (
    <Tag id={id} className={cn(styles.heading, styles[`heading--${size}`], className)}>
      {children}
    </Tag>
  );
}
