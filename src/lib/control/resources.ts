import type { ArchiveSegment, Experience, Mission, Pilot, Technology } from '@/types/domain';
import type { IconName } from '@/types/common';
import { apiFetch } from './client';

/**
 * Admin row for a contact frequency. Mirrors the API (which includes `order`
 * for list sorting) rather than the stricter frontend `Frequency` type.
 */
export interface FrequencyRow {
  id: string;
  label: string;
  handle: string;
  url: string;
  icon: IconName;
  primary: boolean;
  order: number;
}

/** Admin row for an editable site-copy string (key/value). */
export interface SiteCopyEntry {
  key: string;
  value: string;
}

/** Admin row for an archive shelf (includes `order` for list sorting). */
export interface ArchiveSectionRow {
  id: string;
  code: string;
  label: string;
  order: number;
}

/** Admin row for an archive record. `section` is a free string (a section id). */
export interface ArchiveRecordRow {
  id: string;
  code: string;
  title: string;
  abstract: string;
  section: string;
  tags: string[];
  archivedAt: string;
  readingMinutes: number;
  body: ArchiveSegment[];
  refs: string[];
  order: number;
}

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
export const frequenciesApi = crud<FrequencyRow>('/admin/frequencies');

// Site-copy's primary key is `key`; crud.remove receives that value positionally.
export const siteCopyApi = crud<SiteCopyEntry>('/admin/site-copy');

export const archiveSectionsApi = crud<ArchiveSectionRow>('/admin/archive/sections');
export const archiveRecordsApi = crud<ArchiveRecordRow>('/admin/archive/records');

/** Pilot is a singleton: GET + PUT, no list or delete. */
export const pilotApi = {
  get: () => apiFetch<Pilot>('/admin/pilot'),
  save: (pilot: Pilot) =>
    apiFetch<Pilot>('/admin/pilot', { method: 'PUT', body: JSON.stringify(pilot) }),
};
