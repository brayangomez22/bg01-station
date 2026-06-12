import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon/Icon';
import type { IconName } from '@/types/common';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost' | 'hud';
type Size = 'sm' | 'md';

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  className?: string;
}

interface ButtonAsButton extends CommonProps {
  to?: undefined;
  href?: undefined;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

interface ButtonAsLink extends CommonProps {
  /** Internal route (react-router). */
  to: string;
  href?: undefined;
}

interface ButtonAsAnchor extends CommonProps {
  /** External URL. */
  href: string;
  to?: undefined;
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    loading = false,
    className,
  } = props;

  const classes = cn(
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    className,
  );

  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      <span className={styles.button__label}>{children}</span>
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </>
  );

  if ('to' in props && props.to !== undefined) {
    return (
      <Link
        to={props.to}
        className={classes}
        data-state={loading ? 'loading' : undefined}
      >
        {inner}
      </Link>
    );
  }

  if ('href' in props && props.href !== undefined) {
    return (
      <a href={props.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }

  const { onClick, type = 'button', disabled } = props as ButtonAsButton;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      data-state={loading ? 'loading' : undefined}
      aria-busy={loading || undefined}
    >
      {inner}
    </button>
  );
}
