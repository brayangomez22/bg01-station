import type { Transition } from 'motion/react';

/**
 * Named transitions. Curves/durations mirror styles/tokens/motion.css
 * (single source of truth across CSS and JS animation).
 */

// cubic-bezier values are duplicated here intentionally to match the CSS tokens.
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_MECHANICAL: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const transitions = {
  base: { duration: 0.3, ease: EASE_OUT } satisfies Transition,
  fast: { duration: 0.12, ease: EASE_MECHANICAL } satisfies Transition,
  slow: { duration: 0.6, ease: EASE_OUT } satisfies Transition,
  warp: { duration: 0.4, ease: EASE_MECHANICAL } satisfies Transition,
  spring: { type: 'spring', stiffness: 320, damping: 30 } satisfies Transition,
} as const;
