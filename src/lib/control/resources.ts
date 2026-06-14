import type { Mission } from '@/types/domain';
import { apiFetch } from './client';

/**
 * Typed CRUD client for one content resource. The backend exposes, per
 * resource: GET (list), PUT (upsert) and DELETE /{id}. There is no single-GET,
 * so editors load the list and find their item — fine at portfolio scale.
 */
function crud<T>(base: string) {
  return {
    list: () => apiFetch<T[]>(base),
    save: (item: T) =>
      apiFetch<T>(base, { method: 'PUT', body: JSON.stringify(item) }),
    remove: (id: string) =>
      apiFetch<void>(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  };
}

export const missionsApi = crud<Mission>('/admin/missions');
