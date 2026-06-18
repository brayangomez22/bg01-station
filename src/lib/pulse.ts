/**
 * Station pulse — a fire-and-forget visit beacon. On load, the public portfolio
 * pings the BG-01 API once per session so the control center can show traffic.
 *
 * Privacy-first, in the spirit of the visitor manifest: no cookies, no IDs, no
 * payload. The server derives a daily-rotating anonymous hash from the request
 * alone (see bg01-api internal/server/visits.go) and stores nothing that
 * identifies a visitor. Every failure is swallowed — analytics must never
 * disturb a page load.
 */

const BASE: string = import.meta.env.VITE_API_BASE_URL ?? '';
const SESSION_KEY = 'bg01:pulsed';

/**
 * Send the visit beacon at most once per browser session. Skips the operator's
 * own /control area, and no-ops when the API base URL is unset (e.g. local dev
 * without a backend). Uses `sendBeacon` (a CORS-simple, non-blocking POST that
 * survives navigation), falling back to a keepalive fetch.
 */
export function sendPulse(): void {
  try {
    if (!BASE) return;
    if (window.location.pathname.startsWith('/control')) return;
    if (sessionStorage.getItem(SESSION_KEY) === 'true') return;
    sessionStorage.setItem(SESSION_KEY, 'true');

    const url = `${BASE}/pulse`;
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(url)) {
      return;
    }
    void fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true }).catch(
      () => {},
    );
  } catch {
    /* storage or network unavailable — stay silent */
  }
}
