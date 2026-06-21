/**
 * lib/hooks/polling/use-dashboard-metrics.ts
 *
 * Polls Community Pulse dashboard metrics via TanStack Query.
 *
 * Calls the existing getDashboardMetrics server action on an interval.
 * Pass SSR data as initialData for instant first paint (no loading flash).
 *
 * @param enabled — Pause polling when false; re-activating triggers an instant refetch.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics, type DashboardMetrics } from "@/app/actions";
import {
  POLLING_INTERVALS,
  POLLING_QUERY_DEFAULTS,
} from "@/lib/query/polling-config";
import { useRefetchOnActivate } from "./use-refetch-on-activate";

/** Cache key — use for invalidateQueries after mutations that affect dashboard KPIs. */
export const dashboardMetricsQueryKey = (tenantSlug: string) =>
  ["dashboard-metrics", tenantSlug] as const;

interface UseDashboardMetricsOptions {
  tenantSlug: string;
  initialData: DashboardMetrics;
  /** Only poll when the Overview tab is visible (default: true). */
  enabled?: boolean;
}

export function useDashboardMetrics({
  tenantSlug,
  initialData,
  enabled = true,
}: UseDashboardMetricsOptions) {
  const query = useQuery({
    queryKey: dashboardMetricsQueryKey(tenantSlug),
    queryFn: () => getDashboardMetrics(tenantSlug),
    initialData,
    enabled,
    refetchInterval: enabled ? POLLING_INTERVALS.DASHBOARD_METRICS : false,
    ...POLLING_QUERY_DEFAULTS,
  });

  useRefetchOnActivate(enabled, query.refetch);

  return query;
}
