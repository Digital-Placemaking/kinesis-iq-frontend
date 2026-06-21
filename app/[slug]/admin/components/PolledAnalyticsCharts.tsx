/**
 * Client wrapper that polls analytics time-series data and renders charts.
 */

"use client";

import { useState } from "react";
import Card from "@/app/components/ui/Card";
import AnalyticsCharts from "../analytics/components/AnalyticsCharts";
import {
  useAnalyticsTimeSeries,
  type AnalyticsTimeSeriesResult,
} from "@/lib/hooks/polling";

const DEFAULT_DAYS = 30;

interface PolledAnalyticsChartsProps {
  tenantSlug: string;
  initialTimeSeries: AnalyticsTimeSeriesResult;
  isActive?: boolean;
}

export default function PolledAnalyticsCharts({
  tenantSlug,
  initialTimeSeries,
  isActive = true,
}: PolledAnalyticsChartsProps) {
  const [days, setDays] = useState(DEFAULT_DAYS);

  const { data: timeSeriesResult, isFetching, error } = useAnalyticsTimeSeries({
    tenantSlug,
    days,
    initialData: days === DEFAULT_DAYS ? initialTimeSeries : undefined,
    enabled: isActive,
  });

  const result = timeSeriesResult ?? initialTimeSeries;

  if (error) {
    return (
      <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
        Failed to refresh charts: {error.message}
      </div>
    );
  }

  if (result.error) {
    return (
      <Card className="p-4 sm:p-6" variant="elevated">
        <p className="text-sm text-red-600 dark:text-red-400">
          Error loading analytics data: {result.error}
        </p>
      </Card>
    );
  }

  return (
    <AnalyticsCharts
      timeSeriesData={result.data}
      dateRange={days}
      onDateRangeChange={setDays}
      isFetching={isFetching}
    />
  );
}
