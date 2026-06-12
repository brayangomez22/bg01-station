import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Container, SectionHeader, TelemetryLine } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { seoByRoute } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { archiveManifest, archiveSections } from '@/content/archive/manifest';
import type { ArchiveSectionId } from '@/types/domain';
import { ArchiveSearch } from './components/ArchiveSearch/ArchiveSearch';
import { SectionFilters } from './components/SectionFilters/SectionFilters';
import { FeaturedRecord } from './components/FeaturedRecord/FeaturedRecord';
import { ArchiveManifest } from './components/ArchiveManifest/ArchiveManifest';
import styles from './ArchivePage.module.css';

/** Diacritics-insensitive needle/haystack normalization. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function ArchivePage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const sectionParam = params.get('s');
  const section = archiveSections.some((s) => s.id === sectionParam)
    ? (sectionParam as ArchiveSectionId)
    : null;

  const setParam = (key: 'q' | 's', value: string | null) => {
    setParams(
      (prev) => {
        if (value) prev.set(key, value);
        else prev.delete(key);
        return prev;
      },
      { replace: true },
    );
  };

  const filtered = useMemo(() => {
    const needle = fold(query.trim());
    return archiveManifest.filter((r) => {
      if (section && r.section !== section) return false;
      if (!needle) return true;
      const haystack = fold(`${r.code} ${r.title} ${r.abstract} ${r.tags.join(' ')}`);
      return haystack.includes(needle);
    });
  }, [query, section]);

  // The featured slot only exists in the unfiltered view; under a query or
  // section filter every match competes as a plain manifest row.
  const isFiltering = Boolean(query.trim() || section);
  const featured = !isFiltering ? filtered[0] : undefined;
  const rows = featured ? filtered.slice(1) : filtered;

  // "/" recalls the search input from anywhere on the page.
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, [contenteditable]');
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Container>
      <Seo {...seoByRoute.archive} path={ROUTES.archive} />
      <SectionHeader
        eyebrow="MÓDULO 06 · ARCHIVO"
        title="Archivo de conocimiento"
        description="Registros técnicos del ingeniero jefe. Cada documento procede de trabajo real: experimentos, incidentes y decisiones de diseño."
        level={1}
      />

      <div className={styles.archive__controls}>
        <ArchiveSearch
          ref={searchRef}
          value={query}
          onChange={(q) => setParam('q', q || null)}
        />
        <SectionFilters
          sections={archiveSections}
          counts={archiveManifest}
          active={section}
          onChange={(s) => setParam('s', s)}
        />
      </div>

      <TelemetryLine live key={`${filtered.length}-${section ?? 'all'}`}>
        {filtered.length}{' '}
        {filtered.length === 1
          ? `registro ${isFiltering ? 'coincide con la consulta' : 'en el archivo'}`
          : `registros ${isFiltering ? 'coinciden con la consulta' : 'en el archivo'}`}
        {section && ` · sección ${archiveSections.find((s) => s.id === section)?.code}`}
      </TelemetryLine>

      {filtered.length === 0 ? (
        <div className={styles.archive__empty}>
          <TelemetryLine tone="warn">
            sin coincidencias en el archivo — ajusta los parámetros de consulta
          </TelemetryLine>
          <Button
            variant="ghost"
            onClick={() => {
              setParam('q', null);
              setParam('s', null);
            }}
          >
            Limpiar consulta
          </Button>
        </div>
      ) : (
        <>
          {featured && <FeaturedRecord record={featured} />}
          <ArchiveManifest records={rows} />
        </>
      )}
    </Container>
  );
}
