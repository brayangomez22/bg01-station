import type { Variants } from 'motion/react';
import { transitions } from './transitions';

/**
 * Reusable Framer Motion variants. Components import from here instead of
 * defining inline animation objects. Reduced-motion is handled globally via
 * MotionConfig (reducedMotion="user").
 */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
};

/** Container that staggers its children's entrance. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Vertical shift when traveling between decks (px). Subtle: the station
    moves past you, you don't fly through it. */
const DECK_TRAVEL_SHIFT = 32;

/**
 * Route transition, directional. `custom` is the travel direction from
 * decks.ts: 1 = descending, -1 = ascending, 0 = same deck. Same-deck
 * navigation keeps the original horizontal "warp" compression; deck travel
 * replaces it with a vertical pass — new content arrives from the deck you
 * are moving toward, old content exits the opposite way.
 */
export const warpTransition: Variants = {
  initial: (direction: number = 0) => ({
    opacity: 0,
    scaleX: direction === 0 ? 0.96 : 1,
    y: direction * DECK_TRAVEL_SHIFT,
    filter: 'blur(6px)',
  }),
  animate: {
    opacity: 1,
    scaleX: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: transitions.warp,
  },
  exit: (direction: number = 0) => ({
    opacity: 0,
    scaleX: direction === 0 ? 1.02 : 1,
    y: direction * -DECK_TRAVEL_SHIFT,
    filter: 'blur(6px)',
    transition: transitions.fast,
  }),
};

/** Mask reveal for headings (clip-path style entrance). */
export const revealMask: Variants = {
  hidden: { opacity: 0, y: '40%' },
  visible: { opacity: 1, y: '0%', transition: transitions.slow },
};
