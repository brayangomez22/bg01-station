import { useId } from 'react';
import { cn } from '@/lib/cn';
import styles from './Field.module.css';

interface BaseFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
}

interface InputFieldProps extends BaseFieldProps {
  as?: 'input';
  type?: 'text' | 'email' | 'password';
}

interface TextareaFieldProps extends BaseFieldProps {
  as: 'textarea';
  rows?: number;
}

type FieldProps = InputFieldProps | TextareaFieldProps;

/** Accessible field: label + control + hint/error wired via aria-describedby. */
export function Field(props: FieldProps) {
  const { label, name, value, onChange, required, error, hint, placeholder } = props;
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    cn(hint ? hintId : undefined, error ? errorId : undefined) || undefined;

  const shared = {
    id,
    name,
    value,
    placeholder,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'data-state': error ? 'error' : undefined,
    className: styles.field__control,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };

  return (
    <div className={styles.field}>
      <label className={styles.field__label} htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      {props.as === 'textarea' ? (
        <textarea {...shared} rows={props.rows ?? 5} />
      ) : (
        <input
          {...shared}
          type={(props as InputFieldProps).type ?? 'text'}
          autoComplete={props.autoComplete}
        />
      )}

      {hint && !error && (
        <p id={hintId} className={styles.field__hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles['field__error']} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export type { FieldProps };
