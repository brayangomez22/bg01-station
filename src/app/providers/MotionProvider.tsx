import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { transitions } from '@/lib/motion/transitions';

/**
 * Global motion configuration. `reducedMotion="user"` makes Framer respect
 * prefers-reduced-motion across the whole app automatically.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={transitions.base}>
      {children}
    </MotionConfig>
  );
}
