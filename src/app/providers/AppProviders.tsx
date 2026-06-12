import type { ReactNode } from 'react';
import { MotionProvider } from './MotionProvider';
import { SoundProvider } from './SoundProvider';
import { BootProvider } from './BootProvider';

/** Composition root for all cross-cutting providers. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <SoundProvider>
        <BootProvider>{children}</BootProvider>
      </SoundProvider>
    </MotionProvider>
  );
}
