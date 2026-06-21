/**
 * lib/hooks/polling/use-analytics-summary.ts
 *
 * Polls analytics summary KPI cards via TanStack Query.
 *
 * Calls getAnalyticsSummary on an interval. Pass SSR data as initialData
 * for instant first paint.
 *
 * @param enabled — Pause polling when false; re-activating triggers an instant refetch.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalyticsSummary } from "@/app/actions";
import {
  POLLING_INTERVALS,
  POLLING_QUERY_DEFAULTS,
} from "@/lib/query/polling-config";
import { useRefetchOnActivate } from "./use-refetch-on-activate";

export type AnalyticsSummary = Awaited<ReturnType<typeof getAnalyticsSummary>>;

/** Cache key — use for invalidateQueries after mutations that affect analytics KPIs. */
export const analyticsSummaryQueryKey = (tenantSlug: string) =>
  ["analytics-summary", tenantSlug] as const;

interface UseAnalyticsSummaryOptions {
  tenantSlug: string;
  initialData: AnalyticsSummary;
  /** Only poll when the Analytics tab is visible (default: true). */
  enabled?: boolean;
}

export function useAnalyticsSummary({
  tenantSlug,
  initialData,
  enabled = true,
}: UseAnalyticsSummaryOptions) {
  const query = useQuery({
    queryKey: analyticsSummaryQueryKey(tenantSlug),
    queryFn: () => getAnalyticsSummary(tenantSlug),
    initialData,
    enabled,
    refetchInterval: enabled ? POLLING_INTERVALS.ANALYTICS_SUMMARY : false,
    ...POLLING_QUERY_DEFAULTS,
  });

  useRefetchOnActivate(enabled, query.refetch);

  return query;
}
