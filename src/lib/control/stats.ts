import { apiFetch } from './client';

/** One day's unique-visitor count, as returned by the API. */
export interface DailyVisits {
  /** Station-local day, 'YYYY-MM-DD'. */
  day: string;
  count: number;
}

/** Traffic summary for the control dashboard. Counts unique visitors per day. */
export interface VisitStats {
  today: number;
  yesterday: number;
  /** Sum of the trailing 7-day window. */
  week: number;
  /** All-time total (unique visitor-days). */
  total: number;
  /** The trailing 7 days, oldest→newest, gaps filled with 0. */
  series: DailyVisits[];
}

/** Fetch the station's visitor stats. Requires an authenticated session. */
export function getStats(): Promise<VisitStats> {
  return apiFetch<VisitStats>('/admin/stats');
}
