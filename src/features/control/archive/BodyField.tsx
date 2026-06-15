import { Icon } from '@/components/ui';
import type { ArchiveSegment } from '@/types/domain';
import { StringListField } from '../components/form/Form';
import styles from './BodyField.module.css';

type Kind = ArchiveSegment['kind'];

const KIND_LABEL: Record<Kind, string> = {
  h: 'Encabezado',
  p: 'Párrafo',
  list: 'Lista',
  code: 'Código',
};

function newSegment(kind: Kind): ArchiveSegment {
  switch (kind) {
    case 'h':
      return { kind: 'h', text: '' };
    case 'p':
      return { kind: 'p', text: '' };
    case 'list':
      return { kind: 'list', items: [] };
    case 'code':
      return { kind: 'code', lang: '', code: '' };
  }
}

interface BodyFieldProps {
  segments: ArchiveSegment[];
  onChange: (segments: ArchiveSegment[]) => void;
}

/** Block editor for an archive record body (h/p/list/code segments). */
export function BodyField({ segments, onChange }: BodyFieldProps) {
  const update = (i: number, seg: ArchiveSegment) =>
    onChange(segments.map((s, idx) => (idx === i ? seg : s)));
  const remove = (i: number) => onChange(segments.filter((_, idx) => idx !== i));
  const add = (kind: Kind) => onChange([...segments, newSegment(kind)]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= segments.length) return;
    const copy = [...segments];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div className={styles.body}>
      <span className={styles.body__label}>Cuerpo (§ segmentos)</span>

      {segments.map((seg, i) => (
        <div key={i} className={styles.block}>
          <div className={styles.block__head}>
            <span className={styles.block__kind}>
              §{String(i + 1).padStart(2, '0')} · {KIND_LABEL[seg.kind]}
            </span>
            <div className={styles.block__controls}>
              <button type="button" onClick={() => move(i, -1)} aria-label="Subir">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Bajar">
                ↓
              </button>
              <button type="button" onClick={() => remove(i)} aria-label="Eliminar">
                <Icon name="close" size={14} />
              </button>
            </div>
          </div>

          {seg.kind === 'h' && (
            <input
              className={styles.control}
              value={seg.text}
              placeholder="Título de sección"
              onChange={(e) => update(i, { kind: 'h', text: e.target.value })}
            />
          )}
          {seg.kind === 'p' && (
            <textarea
              className={styles.control}
              rows={3}
              value={seg.text}
              onChange={(e) => update(i, { kind: 'p', text: e.target.value })}
            />
          )}
          {seg.kind === 'list' && (
            <StringListField
              label="Items"
              items={seg.items}
              onChange={(items) => update(i, { kind: 'list', items })}
            />
          )}
          {seg.kind === 'code' && (
            <>
              <input
                className={styles.control}
                value={seg.lang}
                placeholder="lenguaje (go, ts…)"
                onChange={(e) => update(i, { kind: 'code', lang: e.target.value, code: seg.code })}
              />
              <textarea
                className={styles.code}
                rows={6}
                value={seg.code}
                onChange={(e) => update(i, { kind: 'code', lang: seg.lang, code: e.target.value })}
              />
            </>
          )}
        </div>
      ))}

      <div className={styles.body__add}>
        {(Object.keys(KIND_LABEL) as Kind[]).map((kind) => (
          <button key={kind} type="button" onClick={() => add(kind)}>
            + {KIND_LABEL[kind]}
          </button>
        ))}
      </div>
    </div>
  );
}
