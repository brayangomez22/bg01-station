import { cn } from '@/lib/cn';
import type { MissionFilterOption } from '../../hooks/useMissionFilters';
import styles from './MissionFilters.module.css';

interface MissionFiltersProps {
  options: MissionFilterOption[];
  active: string;
  onChange: (id: string) => void;
}

export function MissionFilters({ options, active, onChange }: MissionFiltersProps) {
  return (
    <div
      className={styles['mission-filters']}
      role="group"
      aria-label="Filtrar misiones por tecnología"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={cn(
            styles['mission-filters__chip'],
            active === opt.id && styles['mission-filters__chip--active'],
          )}
          aria-pressed={active === opt.id}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
