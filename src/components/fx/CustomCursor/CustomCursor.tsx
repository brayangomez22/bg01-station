import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useHasHover } from '@/hooks/useMediaQuery';
import styles from './CustomCursor.module.css';

const INTERACTIVE = 'a, button, [data-cursor="interactive"], input, textarea';

/** Active reticle half-size + border: the ring never crosses this margin,
    so the full instrument stays readable even when the pointer rides the
    viewport edges (HUD on top, NavDock at the bottom). */
const EDGE_MARGIN = 24;

const clampToViewport = (v: number, limit: number) =>
  Math.min(Math.max(v, EDGE_MARGIN), limit - EDGE_MARGIN);

/** Dot + ring cursor that reacts to interactive elements. Hidden on touch. */
export function CustomCursor() {
  const hasHover = useHasHover();
  const { x, y } = useMousePosition();
  const [active, setActive] = useState(false);

  const ringX = useSpring(x, { stiffness: 350, damping: 32 });
  const ringY = useSpring(y, { stiffness: 350, damping: 32 });

  // The dot tracks the pointer exactly; the ring stops at the screen edge.
  const boundedX = useTransform(ringX, (v) => clampToViewport(v, window.innerWidth));
  const boundedY = useTransform(ringY, (v) => clampToViewport(v, window.innerHeight));

  useEffect(() => {
    if (!hasHover) return;
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      setActive(Boolean(target?.closest(INTERACTIVE)));
    };
    document.addEventListener('pointerover', onOver);
    return () => document.removeEventListener('pointerover', onOver);
  }, [hasHover]);

  if (!hasHover) return null;

  return (
    <>
      <motion.span className={styles.cursor__dot} style={{ x, y }} aria-hidden="true" />
      <motion.span
        className={styles.cursor__ring}
        data-active={active || undefined}
        style={{ x: boundedX, y: boundedY }}
        aria-hidden="true"
      />
    </>
  );
}
