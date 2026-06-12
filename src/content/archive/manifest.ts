import type { ArchiveMeta, ArchiveSection, ArchiveSectionId } from '@/types/domain';

/**
 * Archive index: sections + record metadata only. Bodies live in
 * ./records.ts so eager consumers (console, manifest page) never pull
 * article text into their chunk.
 */

export const archiveSections: ArchiveSection[] = [
  { id: 'lng', code: 'S-LNG', label: 'Lenguajes' },
  { id: 'ing', code: 'S-ING', label: 'Ingeniería' },
  { id: 'ops', code: 'S-OPS', label: 'Operaciones' },
  { id: 'bit', code: 'S-BIT', label: 'Bitácora técnica' },
];

export function sectionById(id: ArchiveSectionId): ArchiveSection {
  // Sections are a closed set; the non-null assertion is safe by construction.
  return archiveSections.find((s) => s.id === id)!;
}

/** Newest first — the order every consumer wants. */
export const archiveManifest: ArchiveMeta[] = [
  {
    id: 'contenedores-go-12mb',
    code: 'REG-003',
    title: 'Contenedores de 12 MB: multi-stage para binarios Go',
    abstract:
      'Cómo pasé de imágenes Docker de 1.1 GB a 12 MB con builds multi-stage, y las tres trampas de usar scratch que me costaron una tarde cada una.',
    section: 'ops',
    tags: ['DEVOPS', 'DOCKER', 'GO', 'LINUX'],
    archivedAt: '2026-05-28',
    readingMinutes: 6,
  },
  {
    id: 'idempotencia-en-pagos',
    code: 'REG-002',
    title: 'Idempotencia en pagos: lo que un retry me enseñó',
    abstract:
      'Un timeout, un reintento automático y un cargo duplicado en producción. El diseño de claves de idempotencia que uso desde entonces en cada API de pagos.',
    section: 'ing',
    tags: ['ARQUITECTURA', 'BACKEND', 'GO'],
    archivedAt: '2026-04-22',
    readingMinutes: 10,
  },
  {
    id: 'goroutines-que-no-mueren',
    code: 'REG-001',
    title: 'Goroutines que no mueren: anatomía de una fuga',
    abstract:
      'La memoria del servicio crecía 40 MB por hora y ningún profiler de heap lo explicaba. Eran goroutines bloqueadas para siempre en un canal sin lector.',
    section: 'lng',
    tags: ['GO', 'CONCURRENCIA', 'DEBUGGING'],
    archivedAt: '2026-03-14',
    readingMinutes: 8,
  },
];

export function metaById(id: string): ArchiveMeta | undefined {
  return archiveManifest.find((r) => r.id === id);
}
