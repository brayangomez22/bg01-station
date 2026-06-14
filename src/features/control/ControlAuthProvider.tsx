import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as auth from '@/lib/control/auth';

type Status = 'checking' | 'authed' | 'anon';

interface ControlAuth {
  status: Status;
  /** Authenticate, then flip to authed. Rejects (ApiError) on bad credentials. */
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ControlAuthContext = createContext<ControlAuth | null>(null);

/**
 * Holds the control-area session state. Scoped to the /control route tree so
 * the public station never probes the API. Checks the session once on mount.
 */
export function ControlAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let active = true;
    auth.getSession().then((ok) => {
      if (active) setStatus(ok ? 'authed' : 'anon');
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (password: string) => {
    await auth.login(password);
    setStatus('authed');
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setStatus('anon');
  }, []);

  return (
    <ControlAuthContext.Provider value={{ status, login, logout }}>
      {children}
    </ControlAuthContext.Provider>
  );
}

export function useControlAuth(): ControlAuth {
  const ctx = useContext(ControlAuthContext);
  if (!ctx) throw new Error('useControlAuth must be used within ControlAuthProvider');
  return ctx;
}
