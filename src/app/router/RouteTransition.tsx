import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { warpTransition } from '@/lib/motion/variants';
import styles from './RouteTransition.module.css';

/**
 * Wraps a route's content with the directional enter/exit animation.
 * Keyed by pathname at the call site (inside AnimatePresence, which must
 * receive the same `custom` so exiting content travels the same way).
 */
export function RouteTransition({
  children,
  direction = 0,
}: {
  children: ReactNode;
  /** Deck travel direction (see decks.ts): 1 down, -1 up, 0 same deck. */
  direction?: -1 | 0 | 1;
}) {
  return (
    <motion.main
      id="main-content"
      className={styles['route-transition']}
      data-travel={direction === 0 ? undefined : direction > 0 ? 'down' : 'up'}
      custom={direction}
      variants={warpTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.main>
  );
}
