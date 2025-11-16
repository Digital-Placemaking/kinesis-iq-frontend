"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Calendar } from "lucide-react";
import { getAnalyticsTimeSeries } from "@/app/actions";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface TimeSeriesData {
  date: string;
  pageVisits: number;
  surveyCompletions: number;
  codeCopies: number;
  couponDownloads: number;
  walletAdds: number;
}

interface AnalyticsChartsProps {
  tenantSlug: string;
  initialTimeSeriesData: TimeSeriesData[];
}

/**
 * Chart configuration for shadcn chart components
 * Defines colors and labels for each metric
 * Uses theme-aware colors that adapt to light/dark mode
 */
const chartConfig: ChartConfig = {
  pageVisits: {
    label: "Page Visits",
    theme: {
      light: "oklch(0.646 0.222 41.116)",
      dark: "oklch(0.488 0.243 264.376)",
    },
  },
  surveyCompletions: {
    label: "Survey Completions",
    theme: {
      light: "oklch(0.6 0.118 184.704)",
      dark: "oklch(0.696 0.17 162.48)",
    },
  },
  codeCopies: {
    label: "Code Copies",
    theme: {
      light: "oklch(0.398 0.07 227.392)",
      dark: "oklch(0.769 0.188 70.08)",
    },
  },
  couponDownloads: {
    label: "Coupon Downloads",
    theme: {
      light: "oklch(0.828 0.189 84.429)",
      dark: "oklch(0.627 0.265 303.9)",
    },
  },
  walletAdds: {
    label: "Wallet Adds",
    theme: {
      light: "oklch(0.769 0.188 70.08)",
      dark: "oklch(0.645 0.246 16.439)",
    },
  },
} satisfies ChartConfig;

/**
 * Analytics Charts Component
 * Displays line graphs showing trends over time for various analytics metrics
 * Uses shadcn/ui chart components for consistent styling
 * Includes date range selectors for each chart
 */
export default function AnalyticsCharts({
  tenantSlug,
  initialTimeSeriesData,
}: AnalyticsChartsProps) {
  const [timeSeriesData, setTimeSeriesData] = useState(initialTimeSeriesData);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(30);

  const handleDateRangeChange = async (days: number) => {
    setLoading(true);
    setDateRange(days);
    try {
      const result = await getAnalyticsTimeSeries(tenantSlug, days);
      if (result.data) {
        setTimeSeriesData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const dateRangeOptions = [
    { label: "7 days", value: 7 },
    { label: "14 days", value: 14 },
    { label: "30 days", value: 30 },
    { label: "60 days", value: 60 },
    { label: "90 days", value: 90 },
  ];

  // Format date for display (MM/DD)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-600 dark:text-zinc-400" />
          <span className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Date Range:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDateRangeChange(option.value)}
              disabled={loading}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 ${
                dateRange === option.value
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Engagement Chart */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Overall Engagement Trends
          </h3>
        </div>
        {loading ? (
          <div className="flex h-[250px] sm:h-[300px] items-center justify-center">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Loading...
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ChartContainer
              config={chartConfig}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-[10px] sm:text-xs"
                  interval="preserveStartEnd"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-[10px] sm:text-xs" width={40} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatDate(value as string)}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="pageVisits"
                  stroke="var(--color-pageVisits)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="surveyCompletions"
                  stroke="var(--color-surveyCompletions)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="codeCopies"
                  stroke="var(--color-codeCopies)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="couponDownloads"
                  stroke="var(--color-couponDownloads)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="walletAdds"
                  stroke="var(--color-walletAdds)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </div>

      {/* Visitor Activity Chart */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Visitor Activity
        </h3>
        {loading ? (
          <div className="flex h-[250px] sm:h-[300px] items-center justify-center">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Loading...
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ChartContainer
              config={chartConfig}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-[10px] sm:text-xs"
                  interval="preserveStartEnd"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-[10px] sm:text-xs" width={40} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatDate(value as string)}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="pageVisits"
                  stroke="var(--color-pageVisits)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="surveyCompletions"
                  stroke="var(--color-surveyCompletions)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </div>

      {/* Conversion Actions Chart */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Conversion Actions
        </h3>
        {loading ? (
          <div className="flex h-[250px] sm:h-[300px] items-center justify-center">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Loading...
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ChartContainer
              config={chartConfig}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-[10px] sm:text-xs"
                  interval="preserveStartEnd"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-[10px] sm:text-xs" width={40} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatDate(value as string)}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="codeCopies"
                  stroke="var(--color-codeCopies)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="couponDownloads"
                  stroke="var(--color-couponDownloads)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="walletAdds"
                  stroke="var(--color-walletAdds)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  );
}
