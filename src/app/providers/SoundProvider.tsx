import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { audioEngine, type SoundName } from '@/lib/audio/engine';

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  /** Fire-and-forget acknowledgment sound; silent no-op while disabled. */
  play: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = 'bg01:sound';

/** Sound is OFF by default (accessibility). Preference persists locally. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'on';
  });

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
      // The toggle click is a user gesture: safe to start/stop the engine here.
      if (next) audioEngine.enable();
      else audioEngine.disable();
      return next;
    });
  }, []);

  // Returning visitors with sound on: autoplay policy blocks audio until the
  // first gesture, so we arm the hum on the first pointer/key interaction.
  useEffect(() => {
    if (!enabled) return;
    const arm = () => audioEngine.enable();
    window.addEventListener('pointerdown', arm, { once: true });
    window.addEventListener('keydown', arm, { once: true });
    return () => {
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
    };
  }, [enabled]);

  const play = useCallback(
    (name: SoundName) => {
      if (enabled) audioEngine.play(name);
    },
    [enabled],
  );

  const value = useMemo<SoundContextValue>(
    () => ({ enabled, toggle, play }),
    [enabled, toggle, play],
  );

  return <SoundContext value={value}>{children}</SoundContext>;
}

export function useSound(): SoundContextValue {
  const ctx = use(SoundContext);
  if (!ctx) throw new Error('useSound must be used within <SoundProvider>');
  return ctx;
}
