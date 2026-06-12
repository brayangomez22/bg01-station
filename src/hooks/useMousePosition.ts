import { useEffect } from 'react';
import { useMotionValue, type MotionValue } from 'motion/react';

/**
 * Tracks the pointer position as MotionValues (no React re-render per move).
 * Returns x/y in viewport pixels. Consumers transform these into effects.
 */
export function useMousePosition(): { x: MotionValue<number>; y: MotionValue<number> } {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        x.set(e.clientX);
        y.set(e.clientY);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [x, y]);

  return { x, y };
}
