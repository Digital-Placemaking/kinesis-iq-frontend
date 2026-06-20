/**
 * lib/hooks/polling/index.ts
 *
 * Barrel export for admin polling hooks.
 */

export {
  useDashboardMetrics,
  dashboardMetricsQueryKey,
} from "./use-dashboard-metrics";

export {
  useAnalyticsTimeSeries,
  analyticsTimeSeriesQueryKey,
  type AnalyticsTimeSeriesResult,
  type AnalyticsTimeSeriesPoint,
} from "./use-analytics-time-series";
