/**
 * app/[slug]/admin/components/AdminContent.tsx
 * Unified admin content component that handles client-side tab switching
 * Eliminates page navigation delays by rendering all sections in a single page
 */

"use client";
import DashboardKPICards from "./DashboardKPICards";
import SentimentDistribution from "./SentimentDistribution";
import EngagementFunnel from "./EngagementFunnel";
import PilotAccessPanel from "./PilotAccessPanel";
import Card from "@/app/components/ui/Card";
import QuestionsClient from "../questions/components/QuestionsClient";
import CouponTabs from "../coupons/components/CouponTabs";
import SettingsClient from "../settings/components/SettingsClient";
import AnalyticsCharts from "../analytics/components/AnalyticsCharts";
import MetricTooltip from "../analytics/components/MetricTooltip";
import EmailsClient from "../emails/components/EmailsClient";
import {
  Eye,
  CheckCircle,
  Copy,
  Download,
  Wallet,
  Mail,
  Send,
  Search,
} from "lucide-react";
import ActionButton from "@/app/components/ui/ActionButton";

export type AdminTab =
  | "overview"
  | "analytics"
  | "questions"
  | "coupons"
  | "emails"
  | "settings";

interface AdminContentProps {
  tenantSlug: string;
  userRole: "owner" | "admin" | "staff";
  // Overview data
  dashboardMetrics: any;
  // Analytics data
  analyticsSummary: any;
  analyticsTimeSeries: any;
  // Questions data
  questions: any[];
  // Coupons data
  coupons: any[];
  canEditCoupons: boolean;
  // Emails data
  emails: any[];
  // Settings data
  tenant: any;
  staffList: any[];
  tenantId: string;
}

interface AdminContentPropsWithTab extends AdminContentProps {
  activeTab: AdminTab;
}

export default function AdminContent({
  tenantSlug,
  userRole,
  dashboardMetrics,
  analyticsSummary,
  analyticsTimeSeries,
  questions,
  coupons,
  canEditCoupons,
  emails,
  tenant,
  staffList,
  tenantId,
  activeTab,
}: AdminContentPropsWithTab) {
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header with Pilot Access */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
                  Community Pulse Dashboard
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Real-time control center for community sentiment and WiFi
                  hotspots
                </p>
              </div>
              <div className="flex justify-end sm:justify-end">
                <PilotAccessPanel
                  tenantSlug={tenantSlug}
                  tenantSubdomain={tenant?.subdomain || null}
                  tenantWebsiteUrl={tenant?.website_url || null}
                />
              </div>
            </div>

            {/* KPI Cards */}
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

            {/* Charts Grid */}
            <div className="mb-6 sm:mb-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {/* Sentiment Distribution */}
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

              {/* Engagement Funnel */}
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
                  surveyResponses={
                    dashboardMetrics.engagementFunnel.surveyResponses
                  }
                  copyCodeClicks={
                    dashboardMetrics.engagementFunnel.copyCodeClicks
                  }
                  downloadWallet={
                    dashboardMetrics.engagementFunnel.downloadWallet
                  }
                />
              </Card>
            </div>
          </div>
        );

      case "analytics":
        if (userRole === "staff") {
          return <div>Access denied</div>;
        }
        return (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
                Analytics
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Track visitor engagement, conversion metrics, and trends over
                time
              </p>
            </div>

            {/* Metrics Cards */}
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
                      {analyticsSummary.pageVisits}
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
                      {analyticsSummary.congratulations}
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
                      {analyticsSummary.copyCode}
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
                      {analyticsSummary.downloads}
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
                      {analyticsSummary.walletAdds}
                    </p>
                  </div>
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 shrink-0 ml-2" />
                </div>
              </Card>
            </div>

            {/* Time-Series Charts */}
            {analyticsTimeSeries.error ? (
              <Card className="p-4 sm:p-6" variant="elevated">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error loading analytics data: {analyticsTimeSeries.error}
                </p>
              </Card>
            ) : (
              <div className="mt-8">
                <AnalyticsCharts
                  tenantSlug={tenantSlug}
                  initialTimeSeriesData={analyticsTimeSeries.data}
                />
              </div>
            )}
          </div>
        );

      case "questions":
        if (userRole === "staff") {
          return <div>Access denied</div>;
        }
        const questionTypeNames: Record<string, string> = {
          sentiment: "Sentiment Question",
          multiple_choice: "Multiple Choice",
          single_choice: "Single Choice",
          ranked_choice: "Ranked Choice",
          likert_5: "Likert Scale (5)",
          likert_7: "Likert Scale (7)",
          nps: "NPS",
          rating_5: "Rating (5)",
          yes_no: "Yes/No",
          open_text: "Open Text",
          numeric: "Numeric",
          slider: "Slider",
          date: "Date",
          time: "Time",
        };
        return (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <QuestionsClient
              questions={questions}
              tenantSlug={tenantSlug}
              questionTypeNames={questionTypeNames}
            />
          </div>
        );

      case "coupons":
        return (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
                {canEditCoupons ? "Coupon Management" : "Issued Coupons"}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {canEditCoupons
                  ? "Create and manage promotional coupons for your customers"
                  : "View and redeem issued coupons"}
              </p>
            </div>
            <CouponTabs
              coupons={coupons}
              tenantSlug={tenantSlug}
              canEditCoupons={canEditCoupons}
            />
          </div>
        );

      case "emails":
        if (userRole === "staff") {
          return <div>Access denied</div>;
        }
        return <EmailsClient tenantSlug={tenantSlug} emails={emails || []} />;

      case "settings":
        if (userRole === "staff") {
          return <div>Access denied</div>;
        }
        return (
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Tenant Settings
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                Manage your business pilot settings and team members.
              </p>
            </div>
            <SettingsClient
              tenant={tenant}
              staffList={staffList}
              userRole={userRole}
              tenantId={tenantId}
            />
          </div>
        );

      default:
        return <div>Unknown tab</div>;
    }
  };

  return <>{renderContent()}</>;
}
