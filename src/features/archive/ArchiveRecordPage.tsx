import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { Button, Container, Heading, Tag, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { pageTitle, SITE } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { recordById, archiveRecords } from '@/content/archive/records';
import { sectionById, metaById } from '@/content/archive/manifest';
import { recordChecksum } from '@/lib/checksum';
import { formatStamp } from '@/lib/format';
import type { ArchiveSegment } from '@/types/domain';
import { CodeSegment } from './components/CodeSegment/CodeSegment';
import styles from './ArchiveRecordPage.module.css';

/** Auto-numbered §01, §02… headings + quiet long-form segments. */
function RecordBody({ segments }: { segments: ArchiveSegment[] }) {
  let headingIndex = 0;
  return (
    <>
      {segments.map((seg, i) => {
        switch (seg.kind) {
          case 'h': {
            headingIndex += 1;
            const n = String(headingIndex).padStart(2, '0');
            return (
              <h2 key={i} className={styles.record__h}>
                <span className={styles['record__h-index']} aria-hidden="true">
                  §{n} —{' '}
                </span>
                {seg.text}
              </h2>
            );
          }
          case 'p':
            return (
              <p key={i} className={styles.record__p}>
                {seg.text}
              </p>
            );
          case 'list':
            return (
              <ul key={i} className={styles.record__list}>
                {seg.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case 'code':
            return <CodeSegment key={i} lang={seg.lang} code={seg.code} />;
        }
      })}
    </>
  );
}

export default function ArchiveRecordPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const record = recordId ? recordById(recordId) : undefined;

  const bodyRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ['start 0.25', 'end 0.75'],
  });
  const readProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  if (!record) {
    return (
      <Container>
        <Seo
          title={pageTitle('Registro inexistente')}
          description="El registro solicitado no figura en el archivo de la estación BG-01."
        />
        <div className={styles.record__missing}>
          <Text variant="mono" tone="accent">
            ⚠ REGISTRO INEXISTENTE
          </Text>
          <Heading level={1} size="xl">
            Documento no catalogado
          </Heading>
          <Text tone="muted">
            El número de serie solicitado no figura en el índice del archivo.
          </Text>
          <Button to={ROUTES.archive} variant="primary" icon="arrow-left">
            Volver al índice
          </Button>
        </div>
      </Container>
    );
  }

  const section = sectionById(record.section);
  const index = archiveRecords.findIndex((r) => r.id === record.id);
  const newer = archiveRecords[index - 1];
  const older = archiveRecords[index + 1];
  const refs = record.refs
    .map((id) => metaById(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: record.title,
    abstract: record.abstract,
    datePublished: record.archivedAt,
    inLanguage: 'es',
    url: `${SITE.url}${ROUTES.archiveRecord(record.id)}`,
    author: { '@type': 'Person', name: SITE.author },
  };

  return (
    <Container>
      <Seo
        title={pageTitle(record.title)}
        description={record.abstract}
        path={ROUTES.archiveRecord(record.id)}
        jsonLd={jsonLd}
      />

      {/* Reading progress: a thin "integrity" line riding the top edge,
          above the docked HUD bar. */}
      <motion.div
        className={styles.record__progress}
        style={{ scaleX: readProgress }}
        aria-hidden="true"
      />

      <div className={styles.record}>
        <div className={styles.record__back}>
          <Button to={ROUTES.archive} variant="ghost" size="sm" icon="arrow-left">
            Volver al índice
          </Button>
        </div>

        {/* Fiche: all the fiction lives here, the body below stays quiet. */}
        <header className={styles.record__fiche}>
          <span className={styles.record__stamp} aria-hidden="true">
            DESCLASIFICADO
          </span>
          <dl className={styles['record__fiche-grid']}>
            <div>
              <dt>REGISTRO</dt>
              <dd className={styles['record__fiche-code']}>{record.code}</dd>
            </div>
            <div>
              <dt>SECCIÓN</dt>
              <dd>
                {section.code} · {section.label.toUpperCase()}
              </dd>
            </div>
            <div>
              <dt>ARCHIVADO</dt>
              <dd>{formatStamp(record.archivedAt)}</dd>
            </div>
            <div>
              <dt>CONSULTA</dt>
              <dd>{record.readingMinutes} MIN</dd>
            </div>
          </dl>
          <div className={styles.record__tags}>
            {record.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </header>

        <Heading level={1} size="lg" className={styles.record__title}>
          {record.title}
        </Heading>

        <article ref={bodyRef} className={styles.record__body}>
          <RecordBody segments={record.body} />
        </article>

        <footer className={styles.record__footer}>
          <div className={styles.record__end} aria-hidden="true">
            <span className={styles['record__end-rule']} />
            <span className={styles['record__end-label']}>FIN DEL REGISTRO</span>
            <span className={styles['record__end-rule']} />
          </div>
          <Text variant="mono" tone="muted" className={styles.record__checksum}>
            SUMA DE CONTROL: {recordChecksum(record.id)} · VERIFICADA
          </Text>

          {refs.length > 0 && (
            <div className={styles.record__refs}>
              <Text variant="mono" tone="accent" as="span">
                REFERENCIAS CRUZADAS
              </Text>
              <ul role="list">
                {refs.map((r) => (
                  <li key={r.id}>
                    <Link to={ROUTES.archiveRecord(r.id)} className={styles['record__ref-link']}>
                      <span>{r.code}</span> {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <nav className={styles.record__siblings} aria-label="Registros contiguos">
            {older ? (
              <Button
                to={ROUTES.archiveRecord(older.id)}
                variant="ghost"
                size="sm"
                icon="arrow-left"
              >
                {older.code}
              </Button>
            ) : (
              <span />
            )}
            {newer && (
              <Button
                to={ROUTES.archiveRecord(newer.id)}
                variant="ghost"
                size="sm"
                iconRight="arrow-right"
              >
                {newer.code}
              </Button>
            )}
          </nav>
        </footer>
      </div>
    </Container>
  );
}
