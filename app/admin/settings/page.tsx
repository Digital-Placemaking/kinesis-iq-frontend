/**
 * app/admin/settings/page.tsx
 * Admin settings page.
 * Allows owner/admin users to manage tenant settings including name, logo, subdomain, and website URL.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, isOwnerOrAdmin } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type { Staff } from "@/lib/types/staff";
import { toTenantDisplay } from "@/lib/utils/tenant";
import AdminLayout from "../components/AdminLayout";
import SettingsClient from "./components/SettingsClient";

export default async function SettingsPage() {
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

  if (staffError || !staff || staff.length === 0) {
    redirect("/admin/login?error=no_tenant");
  }

  const tenantId = staff[0].tenant_id;
  const userRole = staff[0].role;

  // Only owner and admin can access settings
  if (!isOwnerOrAdmin({ role: userRole } as any)) {
    redirect("/admin?error=unauthorized");
  }

  // Create tenant-scoped client
  const tenantSupabase = await createTenantClient(tenantId);

  // Get tenant info with all fields needed for settings
  // Note: We don't filter by active here - admin should be able to see inactive tenants
  const { data: tenant, error: tenantError } = await tenantSupabase
    .from("tenants")
    .select(
      "id, slug, subdomain, name, logo_url, website_url, theme, active, created_at"
    )
    .eq("id", tenantId)
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect("/admin/login?error=tenant_not_found");
  }

  // Get staff list directly using tenant-scoped client (bypasses resolve_tenant RPC)
  // This ensures we can fetch staff even when tenant is inactive
  const { data: staffList, error: staffListError } = await tenantSupabase
    .from("staff")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true });

  if (staffListError) {
    console.error("Failed to fetch staff list:", {
      error: staffListError,
      message: staffListError.message,
      code: staffListError.code,
      tenantId,
    });
  }

  const tenantDisplay = toTenantDisplay(tenant);

  return (
    <AdminLayout userRole={userRole}>
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
          staffList={(staffList as Staff[]) || []}
          userRole={userRole}
          tenantId={tenantId}
        />
      </div>
    </AdminLayout>
  );
}
