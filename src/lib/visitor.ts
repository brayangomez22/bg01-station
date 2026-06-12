/**
 * Visitor manifest — the station remembers who docks. Everything lives in
 * localStorage (no cookies, no external calls, no tracking): the ID exists
 * only so the boot sequence and the console can address the visitor.
 * Storage being unavailable (private mode) degrades to anonymity, never to
 * an error.
 */

export interface VisitorManifest {
  /** Assigned on first docking, e.g. 'VST-7C3F'. */
  id: string;
  firstVisit: string;
  lastVisit: string;
  /** Counted once per browser session. */
  visits: number;
}

const STORAGE_KEY = 'bg01:visitor';
const SESSION_KEY = 'bg01:visit-counted';

function newId(): string {
  const bytes = new Uint8Array(2);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `VST-${hex.toUpperCase()}`;
}

/** Current manifest, or null when storage is unavailable or empty. */
export function getVisitor(): VisitorManifest | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisitorManifest;
    return typeof parsed?.id === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Register the current session's arrival: creates the manifest on first
 * docking, increments the visit counter at most once per session.
 * Idempotent — safe to call from render initializers and under StrictMode.
 */
export function dockVisitor(): VisitorManifest | null {
  try {
    const current = getVisitor();
    if (current && sessionStorage.getItem(SESSION_KEY) === 'true') return current;

    const now = new Date().toISOString();
    const next: VisitorManifest = current
      ? { ...current, visits: current.visits + 1, lastVisit: now }
      : { id: newId(), firstVisit: now, lastVisit: now, visits: 1 };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    sessionStorage.setItem(SESSION_KEY, 'true');
    return next;
  } catch {
    return null;
  }
}
