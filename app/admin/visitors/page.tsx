/**
 * Visitors admin page
 * Displays visitor analytics and engagement metrics
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { getAnalyticsSummary } from "@/app/actions";
import AdminLayout from "../components/AdminLayout";
import Card from "@/app/components/ui/Card";
import { Eye, CheckCircle, Copy, Download, Wallet } from "lucide-react";

export default async function VisitorsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Find user's tenant and role
  const { data: staff } = await supabase
    .from("staff")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!staff || staff.length === 0) {
    redirect("/admin/login?error=no_tenant");
  }

  const tenantId = staff[0].tenant_id;
  const userRole = staff[0].role;

  // Redirect staff users to coupons page (they can only access issued coupons)
  if (userRole === "staff") {
    redirect("/admin/coupons");
  }

  const tenantSupabase = await createTenantClient(tenantId);

  // Get tenant slug for analytics queries
  const { data: tenant } = await tenantSupabase
    .from("tenants")
    .select("slug")
    .eq("id", tenantId)
    .maybeSingle();

  if (!tenant) {
    redirect("/admin/login?error=tenant_not_found");
  }

  // Fetch analytics summary from analytics_events table
  const analyticsSummary = await getAnalyticsSummary(tenant.slug);

  const pageVisits = analyticsSummary.pageVisits;
  const congratulations = analyticsSummary.congratulations;
  const copyCode = analyticsSummary.copyCode;
  const downloads = analyticsSummary.downloads;
  const walletAdds = analyticsSummary.walletAdds;
  const uniqueActionTakers = analyticsSummary.uniqueActionTakers || 0;

  const funnelSteps = [
    { label: "Page Visits", value: pageVisits, color: "bg-blue-500" },
    {
      label: "Reached Congratulations",
      value: congratulations,
      color: "bg-green-500",
    },
    { label: "Copied Coupon Code", value: copyCode, color: "bg-purple-500" },
    { label: "Downloaded Coupon", value: downloads, color: "bg-orange-500" },
    { label: "Added to Wallet", value: walletAdds, color: "bg-yellow-500" },
  ];

  const maxValue = Math.max(...funnelSteps.map((step) => step.value));

  // Calculate overall conversion rate
  // Percentage of unique visitors who took at least one action (copy, download, or wallet)
  const conversionRate =
    pageVisits > 0
      ? ((uniqueActionTakers / pageVisits) * 100).toFixed(1)
      : "0.0";

  return (
    <AdminLayout userRole={userRole}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Visitors
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Track visitor engagement and conversion metrics
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="mb-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Page Visits
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {pageVisits}
                </p>
              </div>
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 shrink-0 ml-2" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Congratulations
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {congratulations}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0 ml-2" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Copy Code
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {copyCode}
                </p>
              </div>
              <Copy className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 shrink-0 ml-2" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Downloads
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {downloads}
                </p>
              </div>
              <Download className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 shrink-0 ml-2" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Wallet Adds
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {walletAdds}
                </p>
              </div>
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 shrink-0 ml-2" />
            </div>
          </Card>
        </div>

        {/* User Engagement Funnel */}
        <Card className="p-4 sm:p-6" variant="elevated">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-zinc-50">
              User Engagement Funnel
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Overall user engagement across all partners
            </p>
          </div>

          <div className="space-y-4">
            {funnelSteps.map((step, index) => {
              const percentage =
                maxValue > 0 ? (step.value / maxValue) * 100 : 0;
              return (
                <div key={index}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-black dark:text-zinc-50">
                      {step.label}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {step.value}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className={`h-full ${step.color} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-4 sm:pt-6 dark:border-zinc-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-black dark:text-zinc-50">
                  Overall Conversion Rate
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Percentage of visitors who took at least one action (copy,
                  download, or wallet)
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-zinc-50">
                  {conversionRate}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
