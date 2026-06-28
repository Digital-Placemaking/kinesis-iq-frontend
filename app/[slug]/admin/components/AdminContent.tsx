/**
 * app/[slug]/admin/components/AdminContent.tsx
 * Unified admin content component that handles client-side tab switching
 * Eliminates page navigation delays by rendering all sections in a single page
 */

"use client";

import OverviewTabContent from "./OverviewTabContent";
import AnalyticsTabContent from "./AnalyticsTabContent";
import SurveysTabContent from "../surveys/components/SurveysTabContent";
import CouponTabs from "../coupons/components/CouponTabs";
import SettingsClient from "../settings/components/SettingsClient";
import EmailsClient from "../emails/components/EmailsClient";
import type { SurveyListEntry } from "@/lib/types";

export type AdminTab =
  | "overview"
  | "analytics"
  | "surveys"
  | "coupons"
  | "emails"
  | "settings";

interface AdminContentProps {
  tenantSlug: string;
  userRole: "owner" | "admin" | "staff";
  // Overview data
  dashboardMetrics: any;
  analyticsSummary: any;
  analyticsTimeSeries: any;
  surveys: SurveyListEntry[];
  coupons: any[];
  canEditCoupons: boolean;
  emails: any[];
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
  surveys,
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
          <OverviewTabContent
            tenantSlug={tenantSlug}
            initialMetrics={dashboardMetrics}
            tenantSubdomain={tenant?.subdomain || null}
            tenantWebsiteUrl={tenant?.website_url || null}
            isActive={activeTab === "overview"}
          />
        );

      case "analytics":
        if (userRole === "staff") {
          return <div>Access denied</div>;
        }
        return (
          <AnalyticsTabContent
            tenantSlug={tenantSlug}
            analyticsSummary={analyticsSummary}
            initialTimeSeries={analyticsTimeSeries}
            isActive={activeTab === "analytics"}
          />
        );

      case "surveys":
        if (userRole === "staff") {
          return <div>Access denied</div>;
        }
        return <SurveysTabContent tenantSlug={tenantSlug} surveyEntries={surveys} />;

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
