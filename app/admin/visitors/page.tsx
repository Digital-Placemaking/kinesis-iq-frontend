/**
 * Visitors admin page
 * Displays visitor analytics and engagement metrics
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import AdminLayout from "../components/AdminLayout";
import Card from "@/app/components/ui/Card";
import { Eye, CheckCircle, Copy, Download, Wallet } from "lucide-react";

export default async function VisitorsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Find user's tenant
  const { data: staff } = await supabase
    .from("staff")
    .select("tenant_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!staff || staff.length === 0) {
    redirect("/admin/login?error=no_tenant");
  }

  const tenantId = staff[0].tenant_id;
  const tenantSupabase = await createTenantClient(tenantId);

  // Fetch visitor metrics from database
  // Page visits: Count unique sessions from survey responses + email opt-ins
  // This gives us a better estimate of total visitors
  const { data: surveySessions } = await tenantSupabase
    .from("survey_responses")
    .select("session_id")
    .not("session_id", "is", null);

  const { data: emailOptIns } = await tenantSupabase
    .from("email_opt_ins")
    .select("email");

  // Count unique sessions and emails
  const uniqueSessions = new Set(
    surveySessions?.map((r) => r.session_id).filter(Boolean) || []
  );
  const uniqueEmails = new Set(
    emailOptIns?.map((e) => e.email).filter(Boolean) || []
  );
  // Page visits: Estimate from unique sessions + unique emails
  const pageVisits = Math.max(uniqueSessions.size, uniqueEmails.size);

  // Congratulations: Count unique completed surveys (distinct session_ids with responses)
  const { data: completedSurveys } = await tenantSupabase
    .from("survey_responses")
    .select("session_id")
    .not("session_id", "is", null);

  const uniqueCompletedSurveys = new Set(
    completedSurveys?.map((r) => r.session_id).filter(Boolean) || []
  );
  const congratulations = uniqueCompletedSurveys.size;

  // Copy Code: Count issued coupons (users who generated codes)
  const { count: issuedCouponsCount } = await tenantSupabase
    .from("issued_coupons")
    .select("*", { count: "exact", head: true });

  const copyCode = issuedCouponsCount || 0;

  // Downloads: Check metadata for download tracking
  // For now, count issued coupons that have been "viewed" (all issued coupons can be downloaded)
  const { data: issuedCoupons } = await tenantSupabase
    .from("issued_coupons")
    .select("metadata");

  const downloads =
    issuedCoupons?.filter((coupon) => coupon.metadata?.downloaded === true)
      .length || 0;

  // Wallet Adds: Check metadata for wallet tracking
  const walletAdds =
    issuedCoupons?.filter((coupon) => coupon.metadata?.wallet_added === true)
      .length || 0;

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
  const totalActions = copyCode + downloads + walletAdds;
  const conversionRate =
    pageVisits > 0 ? ((totalActions / pageVisits) * 100).toFixed(1) : "0.0";

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Visitors
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Track visitor engagement and conversion metrics
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Page Visits
                </p>
                <p className="mt-1 text-2xl font-bold text-black dark:text-zinc-50">
                  {pageVisits}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Congratulations
                </p>
                <p className="mt-1 text-2xl font-bold text-black dark:text-zinc-50">
                  {congratulations}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Copy Code
                </p>
                <p className="mt-1 text-2xl font-bold text-black dark:text-zinc-50">
                  {copyCode}
                </p>
              </div>
              <Copy className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Downloads
                </p>
                <p className="mt-1 text-2xl font-bold text-black dark:text-zinc-50">
                  {downloads}
                </p>
              </div>
              <Download className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Wallet Adds
                </p>
                <p className="mt-1 text-2xl font-bold text-black dark:text-zinc-50">
                  {walletAdds}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* User Engagement Funnel */}
        <Card className="p-6" variant="elevated">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              User Engagement Funnel
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
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

          <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black dark:text-zinc-50">
                  Overall Conversion Rate
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Percentage of visitors who took at least one action (copy,
                  download, or wallet)
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-black dark:text-zinc-50">
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
