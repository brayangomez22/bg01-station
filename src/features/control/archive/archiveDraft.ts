import type { ArchiveRecordRow, ArchiveSectionRow } from '@/lib/control/resources';

/** A blank archive section, ready to edit. */
export function blankSection(): ArchiveSectionRow {
  return { id: '', code: '', label: '', order: 0 };
}

/** A blank archive record, ready to edit. */
export function blankRecord(): ArchiveRecordRow {
  return {
    id: '',
    code: '',
    title: '',
    abstract: '',
    section: '',
    tags: [],
    archivedAt: '',
    readingMinutes: 5,
    body: [],
    refs: [],
    order: 0,
  };
}
