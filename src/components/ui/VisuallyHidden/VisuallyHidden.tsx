import type { ReactNode } from 'react';
import styles from './VisuallyHidden.module.css';

/** Content available to screen readers but visually hidden. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className={styles['visually-hidden']}>{children}</span>;
}
