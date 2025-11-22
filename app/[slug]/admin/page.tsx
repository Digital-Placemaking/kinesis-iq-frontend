/**
 * app/[slug]/admin/page.tsx
 * Tenant-specific admin dashboard page.
 * Shows login form if not authenticated, otherwise shows dashboard.
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getBusinessOwnerForTenantSlug } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { createClient } from "@/lib/supabase/server";
import { getTenantBySlug } from "@/app/actions/tenant";
import DashboardHeader from "@/app/[slug]/admin/components/DashboardHeader";
import StatCards from "@/app/[slug]/admin/components/StatCards";
import ClientQuickActions from "@/app/[slug]/admin/components/ClientQuickActions";
import TenantAdminLoginForm from "./login/components/TenantAdminLoginForm";
import Footer from "@/app/components/Footer";

interface AdminDashboardProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminDashboard({
  params,
  searchParams,
}: AdminDashboardProps) {
  const { slug } = await params;
  const { error } = await searchParams;

  // Fetch tenant data for login form display (name and logo)
  const { tenant: tenantData } = await getTenantBySlug(slug);
  const tenantName = tenantData?.name || slug.toUpperCase();
  const tenantLogo = tenantData?.logo_url || null;

  // Check if user is authenticated
  const user = await getCurrentUser();

  // If not authenticated, show login form on this page
  if (!user) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md">
            <TenantAdminLoginForm
              tenantSlug={slug}
              tenantName={tenantName}
              tenantLogo={tenantLogo}
              error={error}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if user has access to this tenant
  const owner = await getBusinessOwnerForTenantSlug(slug);

  // If no access, show login form with error
  if (!owner) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md">
            <TenantAdminLoginForm
              tenantSlug={slug}
              tenantName={tenantName}
              tenantLogo={tenantLogo}
              error="unauthorized"
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const supabase = await createClient();

  // Resolve tenant slug to UUID
  const { data: tenantId } = await supabase.rpc("resolve_tenant", {
    slug_input: slug,
  });

  if (!tenantId) {
    redirect(`/${slug}/admin/login?error=tenant_not_found`);
  }

  // Create tenant-scoped client
  const tenantSupabase = await createTenantClient(tenantId);

  // Get tenant info for display
  const { data: tenant, error: tenantError } = await tenantSupabase
    .from("tenants")
    .select("id, slug, name, logo_url, website_url")
    .eq("id", tenantId)
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect(`/${slug}/admin/login?error=tenant_not_found`);
  }

  // Fetch statistics for dashboard
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

  /**
   * Quick actions for the dashboard
   * Only shown for owner/admin roles, not for staff members
   */
  const quickActions =
    owner.role === "owner" || owner.role === "admin"
      ? [
          { label: "Create Coupon" },
          { label: "Add Survey Question" },
          { href: `/${slug}/admin/coupons`, label: "View All Coupons" },
          { href: `/${slug}/admin/settings`, label: "Tenant Settings" },
        ]
      : [];

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardHeader
        userEmail={owner.email || user.email || ""}
        tenant={{
          id: tenantId,
          name: tenant.name,
          slug: tenant.slug,
          logo_url: tenant.logo_url,
        }}
      />
      <StatCards
        couponCount={couponCount}
        surveyCount={surveyCount}
        issuedCouponCount={issuedCouponCount}
      />
      {/* Interactive Quick Actions (client) - only show for owner/admin */}
      {quickActions.length > 0 && (
        <ClientQuickActions tenantSlug={tenant.slug} actions={quickActions} />
      )}
    </div>
  );
}
