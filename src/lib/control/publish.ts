import { apiFetch } from './client';

/**
 * Trigger a rebuild + redeploy of the public static site. The API fires a
 * GitHub repository_dispatch; the deploy workflow then syncs content from
 * /export and publishes. Returns once the dispatch is accepted (the build runs
 * asynchronously on GitHub).
 */
export const publish = (): Promise<{ triggered: boolean }> =>
  apiFetch<{ triggered: boolean }>('/admin/publish', { method: 'POST' });
