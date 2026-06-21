/**
 * Analytics tab with polled summary cards and time-series charts (60s interval).
 * SSR snapshots are passed as initialData; metrics refresh while tab is active.
 */

"use client";

import { useState } from "react";
import {
  Eye,
  CheckCircle,
  Copy,
  Download,
  Wallet,
} from "lucide-react";
import Card from "@/app/components/ui/Card";
import PollingIndicator from "@/app/components/ui/PollingIndicator";
import AnalyticsCharts from "../analytics/components/AnalyticsCharts";
import MetricTooltip from "../analytics/components/MetricTooltip";
import {
  useAnalyticsSummary,
  useAnalyticsTimeSeries,
  type AnalyticsSummary,
  type AnalyticsTimeSeriesResult,
} from "@/lib/hooks/polling";

const DEFAULT_DAYS = 30;

interface AnalyticsTabContentProps {
  tenantSlug: string;
  analyticsSummary: AnalyticsSummary;
  initialTimeSeries: AnalyticsTimeSeriesResult;
  isActive: boolean;
}

export default function AnalyticsTabContent({
  tenantSlug,
  analyticsSummary: initialSummary,
  initialTimeSeries,
  isActive,
}: AnalyticsTabContentProps) {
  const [days, setDays] = useState(DEFAULT_DAYS);

  const {
    data: summaryData,
    isFetching: isSummaryFetching,
    dataUpdatedAt: summaryUpdatedAt,
    error: summaryError,
  } = useAnalyticsSummary({
    tenantSlug,
    initialData: initialSummary,
    enabled: isActive,
  });

  const {
    data: timeSeriesResult,
    isFetching: isTimeSeriesFetching,
    dataUpdatedAt: timeSeriesUpdatedAt,
    error: timeSeriesError,
  } = useAnalyticsTimeSeries({
    tenantSlug,
    days,
    initialData: days === DEFAULT_DAYS ? initialTimeSeries : undefined,
    enabled: isActive,
  });

  const summary = summaryData ?? initialSummary;
  const result = timeSeriesResult ?? initialTimeSeries;
  const isFetching = isSummaryFetching || isTimeSeriesFetching;
  const dataUpdatedAt = Math.max(summaryUpdatedAt, timeSeriesUpdatedAt);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
          Analytics
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Track visitor engagement, conversion metrics, and trends over time
        </p>
        <PollingIndicator
          isFetching={isFetching}
          dataUpdatedAt={dataUpdatedAt}
          className="mt-2"
        />
      </div>

      {(summaryError || timeSeriesError) && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {summaryError && `Failed to refresh summary: ${summaryError.message}`}
          {summaryError && timeSeriesError && " "}
          {timeSeriesError && `Failed to refresh charts: ${timeSeriesError.message}`}
        </div>
      )}

      {summary.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {summary.error}
        </div>
      )}

      <div className="mb-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Page Visits
                </p>
                <MetricTooltip description="Unique visitors who have visited your tenant landing page. Counted by email or session ID." />
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                {summary.pageVisits}
              </p>
            </div>
            <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 shrink-0 ml-2" />
          </div>
        </Card>

        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Congratulations
                </p>
                <MetricTooltip description="Unique visitors who completed a survey and reached the congratulations page. This represents survey completion rate." />
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                {summary.congratulations}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0 ml-2" />
          </div>
        </Card>

        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Copy Code
                </p>
                <MetricTooltip description="Total number of times visitors clicked the copy button to copy their coupon code to clipboard." />
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                {summary.copyCode}
              </p>
            </div>
            <Copy className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 shrink-0 ml-2" />
          </div>
        </Card>

        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Downloads
                </p>
                <MetricTooltip description="Total number of times visitors downloaded their coupon as an image file." />
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                {summary.downloads}
              </p>
            </div>
            <Download className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 shrink-0 ml-2" />
          </div>
        </Card>

        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Wallet Adds
                </p>
                <MetricTooltip description="Total number of times visitors successfully added their coupon to Google Wallet or Apple Wallet." />
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                {summary.walletAdds}
              </p>
            </div>
            <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 shrink-0 ml-2" />
          </div>
        </Card>
      </div>

      {result.error ? (
        <Card className="p-4 sm:p-6" variant="elevated">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error loading analytics data: {result.error}
          </p>
        </Card>
      ) : (
        <div className="mt-8">
          <AnalyticsCharts
            timeSeriesData={result.data}
            dateRange={days}
            onDateRangeChange={setDays}
            isFetching={isTimeSeriesFetching}
          />
        </div>
      )}
    </div>
  );
}
