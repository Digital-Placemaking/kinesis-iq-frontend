import { redirect } from "next/navigation";
import { requireBusinessOwnerAccess } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { createClient } from "@/lib/supabase/server";
import Card from "@/app/components/ui/Card";

interface AdminDashboardProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { slug } = await params;

  // Require business owner access
  const { user, owner } = await requireBusinessOwnerAccess(
    slug,
    `/admin/login?redirect=/${slug}/admin&error=unauthorized`
  );

  const supabase = await createClient();

  // Resolve tenant slug to UUID
  const { data: tenantId } = await supabase.rpc("resolve_tenant", {
    slug_input: slug,
  });

  if (!tenantId) {
    redirect("/admin/login");
  }

  // Create tenant-scoped client
  const tenantSupabase = await createTenantClient(tenantId);

  // Fetch statistics
  const [couponsResult, surveysResult, issuedCouponsResult] = await Promise.all(
    [
      tenantSupabase
        .from("coupons")
        .select("id", { count: "exact", head: true }),
      tenantSupabase
        .from("survey_questions")
        .select("id", { count: "exact", head: true }),
      tenantSupabase
        .from("issued_coupons")
        .select("id", { count: "exact", head: true }),
    ]
  );

  const couponCount = couponsResult.count || 0;
  const surveyCount = surveysResult.count || 0;
  const issuedCouponCount = issuedCouponsResult.count || 0;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back, {owner.email || user.email}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6" variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Coupons
              </p>
              <p className="mt-2 text-3xl font-bold text-black dark:text-zinc-50">
                {couponCount}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6" variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Survey Questions
              </p>
              <p className="mt-2 text-3xl font-bold text-black dark:text-zinc-50">
                {surveyCount}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6" variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Issued Coupons
              </p>
              <p className="mt-2 text-3xl font-bold text-black dark:text-zinc-50">
                {issuedCouponCount}
              </p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20">
              <svg
                className="h-6 w-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4" variant="elevated">
            <a
              href={`/${slug}/admin/coupons/new`}
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Create Coupon
            </a>
          </Card>
          <Card className="p-4" variant="elevated">
            <a
              href={`/${slug}/admin/surveys/new`}
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Add Survey Question
            </a>
          </Card>
          <Card className="p-4" variant="elevated">
            <a
              href={`/${slug}/admin/coupons`}
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View All Coupons
            </a>
          </Card>
          <Card className="p-4" variant="elevated">
            <a
              href={`/${slug}/admin/settings`}
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Tenant Settings
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
