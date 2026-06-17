import type { ArchiveMeta, ArchiveSection, ArchiveSectionId } from '@/types/domain';
import sections from '../_generated/archive-sections.json';
import manifest from '../_generated/archive-manifest.json';

/**
 * Archive index: sections + record metadata only. Bodies live in
 * ./records.ts so eager consumers (console, manifest page) never pull
 * article text into their chunk. Sourced from the generated bundle.
 */
export const archiveSections = sections as unknown as ArchiveSection[];

export function sectionById(id: ArchiveSectionId): ArchiveSection {
  // Sections are a closed set; the non-null assertion is safe by construction.
  return archiveSections.find((s) => s.id === id)!;
}

/** Newest first — the order every consumer wants. */
export const archiveManifest = manifest as unknown as ArchiveMeta[];

export function metaById(id: string): ArchiveMeta | undefined {
  return archiveManifest.find((r) => r.id === id);
}
