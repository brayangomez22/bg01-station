import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

interface BootContextValue {
  /** True until the docking sequence completes. */
  booting: boolean;
  /** Called by the BootSequence when the user docks / assets are ready. */
  complete: () => void;
}

const BootContext = createContext<BootContextValue | null>(null);

/** Also read by the pre-paint script in index.html — keep both in sync. */
const SESSION_KEY = 'bg01:docked';

function isDocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Docking is only ever written by `complete` below, which also sets state. */
const subscribe = () => () => {};

export function BootProvider({ children }: { children: ReactNode }) {
  // The prerendered HTML can't know whether this browser session already
  // docked, so it always ships the overlay and the hydration render matches
  // it (server snapshot: not docked). For docked sessions the pre-paint
  // script in index.html hides the overlay (html[data-docked]) until React
  // re-renders with the real snapshot and unmounts it.
  const docked = useSyncExternalStore(subscribe, isDocked, () => false);
  const [completed, setCompleted] = useState(false);
  const booting = !docked && !completed;

  const complete = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // Storage unavailable: the boot simply plays again next load.
    }
    setCompleted(true);
  }, []);

  const value = useMemo<BootContextValue>(
    () => ({ booting, complete }),
    [booting, complete],
  );

  return <BootContext value={value}>{children}</BootContext>;
}

export function useBoot(): BootContextValue {
  const ctx = use(BootContext);
  if (!ctx) throw new Error('useBoot must be used within <BootProvider>');
  return ctx;
}
