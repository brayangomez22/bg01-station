import type { RefObject } from 'react';
import { useScroll, type MotionValue } from 'motion/react';

/**
 * Thin wrapper over Framer's useScroll for a target element, returning the
 * 0..1 progress of the element scrolling through the viewport.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target,
    offset: ['start end', 'end start'],
  });
  return scrollYProgress;
}
