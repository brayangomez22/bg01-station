/** ISO 8601 date string, e.g. "2025-01-15". */
export type ISODate = string;

/** Image / media reference. Dimensions are required to prevent CLS. */
export interface MediaRef {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Optional low-res or solid-color placeholder (LQIP / data-uri). */
  placeholder?: string;
}

/** A labelled value, used for stats and metrics. */
export interface LabelledValue {
  label: string;
  value: string;
}

/** SVG icon identifier resolved by the Icon component registry. */
export type IconName =
  | 'github'
  | 'linkedin'
  | 'email'
  | 'external'
  | 'arrow-right'
  | 'arrow-left'
  | 'close'
  | 'menu'
  | 'signal'
  | 'planet';
