import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { NebulaBackdrop } from '@/components/fx/NebulaBackdrop/NebulaBackdrop';
import { DeepSpace } from '@/components/fx/DeepSpace/DeepSpace';
import { HullTexture } from '@/components/fx/HullTexture/HullTexture';
import { CustomCursor } from '@/components/fx/CustomCursor/CustomCursor';
import { ControlAuthProvider } from '@/features/control/ControlAuthProvider';
import styles from './ControlShell.module.css';

/**
 * Layout for the /control area. A sibling of StationShell — deliberately NOT a
 * deck (it never touches decks.ts, the NavDock or the route transition). It
 * reuses the station's background FX and tokens for narrative continuity, but
 * owns its own chrome (the command rail lives in ControlGuard). All children
 * share one session via ControlAuthProvider.
 */
export function ControlShell() {
  return (
    <ControlAuthProvider>
      <div className={styles.control}>
        <div className={styles.control__bg} aria-hidden="true">
          <NebulaBackdrop />
          <DeepSpace />
        </div>
        <HullTexture />
        <CustomCursor />

        <div className={styles.control__view}>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </ControlAuthProvider>
  );
}
