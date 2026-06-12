import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { fadeInUp } from '@/lib/motion/variants';

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  className?: string;
}

/** Convenience wrapper: fade-up once on scroll into view. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
