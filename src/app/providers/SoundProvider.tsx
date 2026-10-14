import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { audioEngine, type SoundName } from '@/lib/audio/engine';

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  /** Fire-and-forget acknowledgment sound; silent no-op while disabled. */
  play: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = 'bg01:sound';

function storedPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

/** Sound is OFF by default (accessibility). Preference persists locally.
    The stored preference only applies after hydration: the prerender (and
    the hydration render matching it) always reports sound off. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const [stored, setStored] = useState<boolean>(storedPreference);
  const enabled = hydrated && stored;

  const toggle = useCallback(() => {
    setStored((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
      } catch {
        // Storage unavailable: the preference lasts for this page only.
      }
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
