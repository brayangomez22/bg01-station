import { cn } from '@/lib/cn';
import type { ArchiveMeta, ArchiveSection, ArchiveSectionId } from '@/types/domain';
import styles from './SectionFilters.module.css';

interface SectionFiltersProps {
  sections: ArchiveSection[];
  /** Full manifest, used to stamp a record count on each shelf. */
  counts: ArchiveMeta[];
  active: ArchiveSectionId | null;
  onChange: (section: ArchiveSectionId | null) => void;
}

/** Archive shelves: one filter button per section, with record counts. */
export function SectionFilters({ sections, counts, active, onChange }: SectionFiltersProps) {
  const countFor = (id: ArchiveSectionId) =>
    counts.filter((r) => r.section === id).length;

  return (
    <div
      className={styles.filters}
      role="group"
      aria-label="Filtrar por sección del archivo"
    >
      <button
        type="button"
        className={cn(styles.filters__btn, active === null && styles['filters__btn--active'])}
        aria-pressed={active === null}
        onClick={() => onChange(null)}
      >
        Todas <span className={styles.filters__count}>{counts.length}</span>
      </button>
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          className={cn(
            styles.filters__btn,
            active === s.id && styles['filters__btn--active'],
          )}
          aria-pressed={active === s.id}
          title={s.label}
          onClick={() => onChange(active === s.id ? null : s.id)}
        >
          {s.code} <span className={styles.filters__count}>{countFor(s.id)}</span>
        </button>
      ))}
    </div>
  );
}
