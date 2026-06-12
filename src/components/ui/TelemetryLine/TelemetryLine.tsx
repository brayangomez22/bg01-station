import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './TelemetryLine.module.css';

interface TelemetryLineProps {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'warn';
  /** Politeness for screen readers when the line updates live. */
  live?: boolean;
  className?: string;
}

/**
 * Global acknowledgment language: every user action gets a `>` response line,
 * the way real spacecraft consoles confirm every input.
 */
export function TelemetryLine({
  children,
  tone = 'default',
  live = false,
  className,
}: TelemetryLineProps) {
  return (
    <p
      className={cn(styles.telemetry, styles[`telemetry--${tone}`], className)}
      aria-live={live ? 'polite' : undefined}
    >
      <span aria-hidden="true">&gt;&nbsp;</span>
      {children}
    </p>
  );
}
