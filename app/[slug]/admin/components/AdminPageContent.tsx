/**
 * app/[slug]/admin/components/AdminPageContent.tsx
 *
 * Server component that fetches all data required for the admin dashboard and passes it to AdminWrapper.
 * This component is separated from the page component to allow for a Suspense boundary,
 * which provides a better loading experience.
 *
 * Handles both active and inactive tenants by falling back to direct database lookup
 * when the `resolve_tenant` RPC fails (e.g., for inactive tenants).
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import {
  getDashboardMetrics,
  getAnalyticsSummary,
  getAnalyticsTimeSeries,
} from "@/app/actions";
import AdminWrapper from "./AdminWrapper";
import { getCurrentUser } from "@/lib/auth/server";
import { getBusinessOwnerForTenantSlug } from "@/lib/auth/server";

interface AdminPageContentProps {
  slug: string;
  user: any;
  owner: any;
}

export default async function AdminPageContent({
  slug,
  user,
  owner,
}: AdminPageContentProps) {
  const supabase = await createClient();

  // Resolve tenant slug to UUID
  // Note: resolve_tenant RPC may filter by active=true, so we handle inactive tenants
  const { data: tenantId, error: resolveError } = await supabase.rpc(
    "resolve_tenant",
    {
      slug_input: slug,
    }
  );

  let resolvedTenantId = tenantId;

  // If resolve_tenant fails (e.g., tenant is inactive), try direct lookup
  // This allows admin/staff to access even when tenant is deactivated
  if (resolveError || !resolvedTenantId) {
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (tenantError || !tenant || !tenant.id) {
      // Security: Don't leak tenant existence - redirect to login
      redirect(`/${slug}/admin?error=tenant_not_found`);
    }
    resolvedTenantId = tenant.id;
  }

  if (!resolvedTenantId) {
    // Security: Don't leak tenant existence - redirect to login
    redirect(`/${slug}/admin?error=tenant_not_found`);
  }

  // Create tenant-scoped client
  const tenantSupabase = await createTenantClient(resolvedTenantId);

  const userRole = owner.role;

  // Fetch all data in parallel for all admin sections
  const [
    dashboardMetrics,
    analyticsSummary,
    analyticsTimeSeries,
    questionsData,
    couponsData,
    emailsData,
    tenantDataFull,
    staffListData,
  ] = await Promise.all([
    // Dashboard metrics
    getDashboardMetrics(slug),

    // Analytics data (only if owner/admin)
    userRole !== "staff"
      ? getAnalyticsSummary(slug)
      : Promise.resolve({
          pageVisits: 0,
          congratulations: 0,
          copyCode: 0,
          downloads: 0,
          walletAdds: 0,
          uniqueActionTakers: 0,
          error: null,
        }),

    // Analytics time series (only if owner/admin)
    userRole !== "staff"
      ? getAnalyticsTimeSeries(slug, 30)
      : Promise.resolve({ data: [], error: null }),

    // Questions (only if owner/admin)
    userRole !== "staff"
      ? tenantSupabase
          .from("survey_questions")
          .select("*")
          .order("order_index", { ascending: true })
      : Promise.resolve({ data: [], error: null }),

    // Coupons
    tenantSupabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false }),

    // Emails (only if owner/admin)
    userRole !== "staff"
      ? tenantSupabase
          .from("email_opt_ins")
          .select("*")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    // Tenant data for settings
    tenantSupabase
      .from("tenants")
      .select(
        "id, slug, subdomain, name, logo_url, website_url, theme, active, created_at"
      )
      .eq("id", resolvedTenantId)
      .maybeSingle(),

    // Staff list for settings
    tenantSupabase
      .from("staff")
      .select("*")
      .eq("tenant_id", resolvedTenantId)
      .order("created_at", { ascending: true }),
  ]);

  // Check for errors
  if (dashboardMetrics.error) {
    console.error("Failed to fetch dashboard metrics:", dashboardMetrics.error);
  }

  const canEditCoupons = userRole === "owner" || userRole === "admin";

  // Fetch available tenants for switcher
  const { data: staffRecords } = await supabase
    .from("staff")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const availableTenants: Array<{ slug: string; name: string | null }> = [];

  if (staffRecords && staffRecords.length > 1) {
    for (const staff of staffRecords) {
      try {
        const tenantSupabase = await createTenantClient(staff.tenant_id);
        const { data: tenant } = await tenantSupabase
          .from("tenants")
          .select("slug, name")
          .eq("id", staff.tenant_id)
          .maybeSingle();

        if (tenant) {
          availableTenants.push({
            slug: tenant.slug,
            name: tenant.name,
          });
        }
      } catch (err) {
        console.error("Error fetching tenant:", err);
      }
    }
  }

  return (
    <AdminWrapper
      tenantSlug={slug}
      user={user}
      owner={owner}
      availableTenants={availableTenants.length > 1 ? availableTenants : []}
      userRole={userRole}
      dashboardMetrics={dashboardMetrics}
      analyticsSummary={analyticsSummary}
      analyticsTimeSeries={analyticsTimeSeries}
      questions={questionsData.data || []}
      coupons={couponsData.data || []}
      canEditCoupons={canEditCoupons}
      emails={emailsData.data || []}
      tenant={tenantDataFull.data}
      staffList={(staffListData.data || []) as any[]}
      tenantId={resolvedTenantId}
    />
  );
}
