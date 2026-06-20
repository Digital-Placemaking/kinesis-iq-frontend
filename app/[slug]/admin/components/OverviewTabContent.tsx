/**
 * Overview tab with polled dashboard metrics (TanStack Query, 30s interval).
 * SSR snapshot is passed as initialData; KPIs refresh while this tab is active.
 */

"use client";

import type { DashboardMetrics } from "@/app/actions";
import { useDashboardMetrics } from "@/lib/hooks/polling";
import PollingIndicator from "@/app/components/ui/PollingIndicator";
import DashboardKPICards from "./DashboardKPICards";
import SentimentDistribution from "./SentimentDistribution";
import EngagementFunnel from "./EngagementFunnel";
import PilotAccessPanel from "./PilotAccessPanel";
import Card from "@/app/components/ui/Card";
import MetricTooltip from "../analytics/components/MetricTooltip";

interface OverviewTabContentProps {
  tenantSlug: string;
  initialMetrics: DashboardMetrics;
  tenantSubdomain: string | null;
  tenantWebsiteUrl: string | null;
  isActive: boolean;
}

export default function OverviewTabContent({
  tenantSlug,
  initialMetrics,
  tenantSubdomain,
  tenantWebsiteUrl,
  isActive,
}: OverviewTabContentProps) {
  const {
    data: metrics,
    isFetching,
    dataUpdatedAt,
    error,
  } = useDashboardMetrics({
    tenantSlug,
    initialData: initialMetrics,
    enabled: isActive,
  });

  const dashboardMetrics = metrics ?? initialMetrics;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Community Pulse Dashboard
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Real-time control center for community sentiment and WiFi hotspots
          </p>
          <PollingIndicator
            isFetching={isFetching}
            dataUpdatedAt={dataUpdatedAt}
            className="mt-2"
          />
        </div>
        <div className="flex justify-end sm:justify-end">
          <PilotAccessPanel
            tenantSlug={tenantSlug}
            tenantSubdomain={tenantSubdomain}
            tenantWebsiteUrl={tenantWebsiteUrl}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          Failed to refresh dashboard: {error.message}
        </div>
      )}

      {dashboardMetrics.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {dashboardMetrics.error}
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <DashboardKPICards
          totalResponses={dashboardMetrics.totalResponses}
          uniqueSessions={dashboardMetrics.uniqueSessions}
          happinessScore={dashboardMetrics.happinessScore}
          happyResponses={dashboardMetrics.happyResponses}
          pageVisits={dashboardMetrics.pageVisits}
          conversionRate={dashboardMetrics.conversionRate}
          engagement={dashboardMetrics.engagement}
          topCoupon={dashboardMetrics.topCoupon}
        />
      </div>

      <div className="mb-6 sm:mb-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <Card className="p-6" variant="elevated">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-zinc-50">
                Sentiment Distribution
              </h2>
              <MetricTooltip description="Shows how visitors are feeling based on their survey responses. Responses to 'Sentiment Question' type questions are categorized as: Happy (4-5), Neutral (3), or Concerned (1-2). If no sentiment questions are set up, the system uses NPS questions instead (7+ = Happy, 4-6 = Neutral, 0-3 = Concerned)." />
            </div>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              How people are feeling
            </p>
          </div>
          <SentimentDistribution
            happy={dashboardMetrics.sentimentDistribution.happy}
            neutral={dashboardMetrics.sentimentDistribution.neutral}
            concerned={dashboardMetrics.sentimentDistribution.concerned}
          />
        </Card>

        <Card className="p-6" variant="elevated">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-zinc-50">
                Engagement Funnel
              </h2>
              <MetricTooltip description="Shows how visitors progress through your experience. Tracks the number of people who: visit your page, complete a survey, copy their coupon code, and download or add their coupon to their wallet. This helps you see where visitors drop off in the process." />
            </div>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              User journey through the experience
            </p>
          </div>
          <EngagementFunnel
            pageVisits={dashboardMetrics.engagementFunnel.pageVisits}
            surveyResponses={dashboardMetrics.engagementFunnel.surveyResponses}
            copyCodeClicks={dashboardMetrics.engagementFunnel.copyCodeClicks}
            downloadWallet={dashboardMetrics.engagementFunnel.downloadWallet}
          />
        </Card>
      </div>
    </div>
  );
}
