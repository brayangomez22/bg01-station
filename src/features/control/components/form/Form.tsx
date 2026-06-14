import { useId, type ReactNode } from 'react';
import { Icon } from '@/components/ui';
import type { LabelledValue } from '@/types/common';
import styles from './Form.module.css';

/** Grouped section of a form, with a stamped legend. */
export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.fieldset__legend}>{legend}</legend>
      <div className={styles.fieldset__body}>{children}</div>
    </fieldset>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.field__label} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={styles.field__control}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.field__label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        className={styles.field__control}
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
      />
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  const id = useId();
  return (
    <label className={styles.checkbox} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

interface StringListFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

/** Editor for an array of plain strings (highlights, challenges, tech ids…). */
export function StringListField({
  label,
  items,
  onChange,
  placeholder,
}: StringListFieldProps) {
  const set = (i: number, v: string) =>
    onChange(items.map((item, idx) => (idx === i ? v : item)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className={styles.list}>
      <span className={styles.field__label}>{label}</span>
      {items.map((item, i) => (
        <div key={i} className={styles.list__row}>
          <input
            className={styles.field__control}
            value={item}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
          />
          <button
            type="button"
            className={styles.list__remove}
            onClick={() => remove(i)}
            aria-label="Eliminar"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
      <button type="button" className={styles.list__add} onClick={add}>
        + Añadir
      </button>
    </div>
  );
}

interface MetricListFieldProps {
  label: string;
  items: LabelledValue[];
  onChange: (items: LabelledValue[]) => void;
}

/** Editor for an array of {label, value} pairs (mission metrics, stats…). */
export function MetricListField({ label, items, onChange }: MetricListFieldProps) {
  const set = (i: number, patch: Partial<LabelledValue>) =>
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { label: '', value: '' }]);

  return (
    <div className={styles.list}>
      <span className={styles.field__label}>{label}</span>
      {items.map((item, i) => (
        <div key={i} className={styles.list__row}>
          <input
            className={styles.field__control}
            value={item.label}
            placeholder="Etiqueta"
            onChange={(e) => set(i, { label: e.target.value })}
          />
          <input
            className={styles.field__control}
            value={item.value}
            placeholder="Valor"
            onChange={(e) => set(i, { value: e.target.value })}
          />
          <button
            type="button"
            className={styles.list__remove}
            onClick={() => remove(i)}
            aria-label="Eliminar"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
      <button type="button" className={styles.list__add} onClick={add}>
        + Añadir
      </button>
    </div>
  );
}
