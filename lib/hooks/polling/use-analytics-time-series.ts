/**
 * lib/hooks/polling/use-analytics-time-series.ts
 *
 * Polls analytics time-series chart data via TanStack Query.
 *
 * Calls getAnalyticsTimeSeries on an interval. Pass SSR data as initialData
 * for instant first paint. Include `days` in the query key so range changes
 * (7 / 30 / 90) cache and poll independently.
 *
 * @param enabled — Set false when the Analytics tab is not active to avoid
 *                  unnecessary Supabase reads while the user is on other tabs.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalyticsTimeSeries } from "@/app/actions";
import {
  POLLING_INTERVALS,
  POLLING_QUERY_DEFAULTS,
} from "@/lib/query/polling-config";

export type AnalyticsTimeSeriesResult = Awaited<
  ReturnType<typeof getAnalyticsTimeSeries>
>;

export type AnalyticsTimeSeriesPoint = AnalyticsTimeSeriesResult["data"][number];

/** Cache key — include days so each date range polls independently. */
export const analyticsTimeSeriesQueryKey = (
  tenantSlug: string,
  days: number
) => ["analytics-time-series", tenantSlug, days] as const;

interface UseAnalyticsTimeSeriesOptions {
  tenantSlug: string;
  /** Number of days of chart data (default: 30). */
  days?: number;
  initialData: AnalyticsTimeSeriesResult;
  /** Only poll when the Analytics tab is visible (default: true). */
  enabled?: boolean;
}

export function useAnalyticsTimeSeries({
  tenantSlug,
  days = 30,
  initialData,
  enabled = true,
}: UseAnalyticsTimeSeriesOptions) {
  return useQuery({
    queryKey: analyticsTimeSeriesQueryKey(tenantSlug, days),
    queryFn: () => getAnalyticsTimeSeries(tenantSlug, days),
    initialData,
    enabled,
    refetchInterval: enabled ? POLLING_INTERVALS.ANALYTICS_TIME_SERIES : false,
    ...POLLING_QUERY_DEFAULTS,
  });
}
