import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface BootContextValue {
  /** True until the docking sequence completes. */
  booting: boolean;
  /** Called by the BootSequence when the user docks / assets are ready. */
  complete: () => void;
}

const BootContext = createContext<BootContextValue | null>(null);

const SESSION_KEY = 'bg01:docked';

export function BootProvider({ children }: { children: ReactNode }) {
  // Skip the boot sequence on subsequent navigations within the same session.
  const [booting, setBooting] = useState<boolean>(() => {
    if (typeof sessionStorage === 'undefined') return true;
    return sessionStorage.getItem(SESSION_KEY) !== 'true';
  });

  const complete = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setBooting(false);
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
