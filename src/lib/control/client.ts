/**
 * Thin HTTP client for the BG-01 control API (the Go backend that administers
 * station content). Public station decks never use this — only the /control
 * area, at runtime. The base URL is the API origin; in production it is the
 * api.* subdomain so the session cookie stays same-site.
 */
const BASE: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/** Error carrying the HTTP status so callers can distinguish 401 from others. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Perform a JSON request against the control API. Always sends credentials so
 * the session cookie travels. Throws {@link ApiError} on non-2xx responses.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  // 204 No Content (e.g. DELETE) carries no body.
  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}
