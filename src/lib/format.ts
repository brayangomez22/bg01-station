import type { ISODate } from '@/types/common';

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

/** "2024-02-01" -> "feb 2024". */
export function formatMonthYear(date: ISODate): string {
  const d = new Date(date);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Format a period for the logbook, handling the 'present' sentinel. */
export function formatPeriod(start: ISODate, end: ISODate | 'present'): string {
  const endLabel = end === 'present' ? 'presente' : formatMonthYear(end);
  return `${formatMonthYear(start)} — ${endLabel}`;
}

/** Year extracted from an ISO date. */
export function yearOf(date: ISODate): string {
  return String(new Date(date).getUTCFullYear());
}

/** Archive stamp date: "2026.05.28" (record fiche & manifest). */
export function formatStamp(date: ISODate): string {
  const d = new Date(date);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}.${p(d.getUTCMonth() + 1)}.${p(d.getUTCDate())}`;
}

/** Mission Elapsed Time epoch: start of the pilot's professional flight. */
export const MET_EPOCH = new Date('2021-01-01T00:00:00Z');

/** NASA-style MET readout: "T+ 1986:07:33:21" (days:hours:minutes:seconds). */
export function formatMET(now: Date = new Date()): string {
  const ms = Math.max(0, now.getTime() - MET_EPOCH.getTime());
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const pad = (n: number, w: number) => String(n).padStart(w, '0');
  return `T+ ${pad(days, 4)}:${pad(hours % 24, 2)}:${pad(minutes % 60, 2)}:${pad(seconds % 60, 2)}`;
}
