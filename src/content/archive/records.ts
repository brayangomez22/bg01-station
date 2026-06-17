import type { ArchiveRecord } from '@/types/domain';
import data from '../_generated/archive-records.json';

/** Full records (meta + body), manifest order (newest first). */
export const archiveRecords = data as unknown as ArchiveRecord[];

export function recordById(id: string): ArchiveRecord | undefined {
  return archiveRecords.find((r) => r.id === id);
}
