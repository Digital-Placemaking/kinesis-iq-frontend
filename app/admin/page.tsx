/**
 * Admin dashboard page
 * Main entry point for tenant administrators
 * Fetches tenant context and displays statistics and quick actions
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import DashboardHeader from "./components/DashboardHeader";
import StatCards from "./components/StatCards";
import QuickActions from "./components/QuickActions";
import ClientQuickActions from "./components/ClientQuickActions";
import { Suspense } from "react";
import AdminLayout from "./components/AdminLayout";

export default async function AdminPage() {
  // Require authentication
  const user = await requireAuth();

  const supabase = await createClient();

  // Find user's tenant(s) and use first one
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("tenant_id, role, email")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (staffError) {
    console.error("Error fetching staff record:", {
      error: staffError,
      message: staffError.message,
      code: staffError.code,
      details: staffError.details,
      hint: staffError.hint,
      userId: user.id,
    });
    redirect("/admin/login?error=staff_query_failed");
  }

  if (!staff || staff.length === 0) {
    console.error("No staff record found for user:", user.id);
    redirect("/admin/login?error=no_tenant");
  }

  const tenantId = staff[0].tenant_id;
  const owner = staff[0];
  const userRole = staff[0].role;

  // Redirect staff users to coupons page (they can only access issued coupons)
  if (userRole === "staff") {
    redirect("/admin/coupons");
  }

  // Create tenant-scoped client to query tenant info (RLS may block regular client)
  const tenantSupabase = await createTenantClient(tenantId);

  // Get tenant info for display using tenant-scoped client
  const { data: tenant, error: tenantError } = await tenantSupabase
    .from("tenants")
    .select("id, slug, name, logo_url, website_url")
    .eq("id", tenantId)
    .maybeSingle();

  if (tenantError) {
    console.error("Error fetching tenant:", {
      error: tenantError,
      message: tenantError.message,
      code: tenantError.code,
      tenantId,
    });
    redirect("/admin/login?error=tenant_query_failed");
  }

  if (!tenant) {
    console.error("Tenant not found for tenant_id:", tenantId);
    redirect("/admin/login?error=tenant_not_found");
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

  // Quick actions (interactive handled by client wrapper below)
  const quickActions = [
    { label: "Create Coupon" },
    { label: "Add Survey Question" },
    { href: "/admin/coupons", label: "View All Coupons" },
    { href: "/admin/settings", label: "Tenant Settings" },
  ];

  return (
    <AdminLayout userRole={userRole}>
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          userEmail={owner.email || user.email}
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
        {/* Interactive Quick Actions (client) */}
        <ClientQuickActions tenantSlug={tenant.slug} actions={quickActions} />
      </div>
    </AdminLayout>
  );
}
