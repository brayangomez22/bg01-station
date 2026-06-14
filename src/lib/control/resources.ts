import type { Experience, Mission, Pilot, Technology } from '@/types/domain';
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
export const technologiesApi = crud<Technology>('/admin/technologies');
export const experiencesApi = crud<Experience>('/admin/experiences');

/** Pilot is a singleton: GET + PUT, no list or delete. */
export const pilotApi = {
  get: () => apiFetch<Pilot>('/admin/pilot'),
  save: (pilot: Pilot) =>
    apiFetch<Pilot>('/admin/pilot', { method: 'PUT', body: JSON.stringify(pilot) }),
};
