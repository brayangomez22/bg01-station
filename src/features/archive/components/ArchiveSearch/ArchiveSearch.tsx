import type { Ref } from 'react';
import styles from './ArchiveSearch.module.css';

interface ArchiveSearchProps {
  value: string;
  onChange: (value: string) => void;
  ref?: Ref<HTMLInputElement>;
}

/** Console-styled index query. "/" focuses it from anywhere on the page. */
export function ArchiveSearch({ value, onChange, ref }: ArchiveSearchProps) {
  return (
    <div className={styles.search}>
      <span className={styles.search__prompt} aria-hidden="true">
        &gt;
      </span>
      <input
        ref={ref}
        type="search"
        className={styles.search__input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="consultar el índice…"
        aria-label="Consultar el índice del archivo"
        autoComplete="off"
        spellCheck={false}
      />
      <kbd className={styles.search__kbd} aria-hidden="true">
        /
      </kbd>
    </div>
  );
}
