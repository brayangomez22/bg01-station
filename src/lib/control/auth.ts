import { apiFetch } from './client';

/** Authenticate the single admin. Throws ApiError(401) on bad credentials. */
export function login(password: string): Promise<void> {
  return apiFetch('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

/** Clear the session cookie. */
export function logout(): Promise<void> {
  return apiFetch('/admin/logout', { method: 'POST' });
}

/**
 * Report whether the current cookie is a valid session. Any failure (401 or a
 * network error with the API asleep/unreachable) resolves to false — the guard
 * then routes to login.
 */
export async function getSession(): Promise<boolean> {
  try {
    await apiFetch('/admin/session');
    return true;
  } catch {
    return false;
  }
}
