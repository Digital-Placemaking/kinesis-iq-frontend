/**
 * lib/query/polling-config.ts
 *
 * Central configuration for TanStack Query polling across the admin dashboard.
 *
 * Why a single config file?
 * - Keeps poll intervals in one place so they are easy to tune
 * - Documents the intended refresh rate for each admin surface
 * - Shared defaults (pause when tab hidden, etc.) stay consistent
 */

import { keepPreviousData } from "@tanstack/react-query";

/** How often each admin surface re-fetches data from server actions (milliseconds). */
export const POLLING_INTERVALS = {
  /** Community Pulse KPI cards, sentiment chart, engagement funnel */
  DASHBOARD_METRICS: 30_000,

  /** Analytics tab summary cards (page visits, copy code, etc.) */
  ANALYTICS_SUMMARY: 60_000,

  /** Analytics time-series line charts */
  ANALYTICS_TIME_SERIES: 60_000,

  /** Issued coupons list — staff may redeem during live events */
  ISSUED_COUPONS: 15_000,

  /** Question results modal while open — live event feedback */
  QUESTION_RESULTS: 10_000,
} as const;

/**
 * Shared TanStack Query options applied to all polling hooks.
 * Spread these into each useQuery call for consistent behavior.
 */
export const POLLING_QUERY_DEFAULTS = {
  /** Do not poll while the browser tab is in the background. */
  refetchIntervalInBackground: false,

  /** Re-fetch when the user returns to the browser tab. */
  refetchOnWindowFocus: true,

  /**
   * Override QueryClient default (refetchOnMount: false).
   * Ensures stale data refetches when an admin tab panel remounts or reactivates.
   */
  refetchOnMount: true,

  /** SSR data is a snapshot; mark stale immediately so refetches run on activation. */
  staleTime: 0,

  /** Keep showing the last good data while a background refetch is in flight. */
  placeholderData: keepPreviousData,
} as const;
