/**
 * app/[slug]/admin/components/AdminWrapper.tsx
 * Wrapper component that manages tab state and coordinates AdminNav and AdminContent
 */

"use client";

import { useState } from "react";
import AdminNav from "./AdminNav";
import AdminContent, { type AdminTab } from "./AdminContent";

interface AdminWrapperProps {
  tenantSlug: string;
  user: any;
  owner: any;
  availableTenants: Array<{ slug: string; name: string | null }>;
  // All data props
  userRole: "owner" | "admin" | "staff";
  dashboardMetrics: any;
  analyticsSummary: any;
  analyticsTimeSeries: any;
  questions: any[];
  coupons: any[];
  canEditCoupons: boolean;
  emails: any[];
  tenant: any;
  staffList: any[];
  tenantId: string;
}

export default function AdminWrapper({
  tenantSlug,
  user,
  owner,
  availableTenants,
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
}: AdminWrapperProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <AdminNav
        tenantSlug={tenantSlug}
        user={user}
        owner={owner}
        availableTenants={availableTenants}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="flex-1">
        <AdminContent
          tenantSlug={tenantSlug}
          userRole={userRole}
          dashboardMetrics={dashboardMetrics}
          analyticsSummary={analyticsSummary}
          analyticsTimeSeries={analyticsTimeSeries}
          questions={questions}
          coupons={coupons}
          canEditCoupons={canEditCoupons}
          emails={emails}
          tenant={tenant}
          staffList={staffList}
          tenantId={tenantId}
          activeTab={activeTab}
        />
      </main>
    </div>
  );
}
