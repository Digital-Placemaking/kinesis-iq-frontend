/**
 * app/[slug]/admin/layout.tsx
 * Layout component for tenant-specific admin routes.
 * Provides authentication and navigation for tenant admin pages.
 * Only renders nav/main if user is authenticated and has access.
 * Never renders nav on login page.
 */

// Force dynamic rendering to prevent caching and ensure fresh session checks
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCurrentUser } from "@/lib/auth/server";
import { getBusinessOwnerForTenantSlug } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import AdminNav from "./components/AdminNav";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { slug } = await params;

  // Check if user is authenticated
  const user = await getCurrentUser();

  // If not authenticated, don't render nav - let page show login form
  if (!user) {
    return <>{children}</>;
  }

  // Check if user has access to this tenant
  const owner = await getBusinessOwnerForTenantSlug(slug);

  // If no access, don't render nav - let page show login form
  if (!owner) {
    return <>{children}</>;
  }

  /**
   * Fetch all tenants the user has access to for the tenant switcher dropdown
   * Only fetches tenant details if user has access to multiple tenants (performance optimization)
   */
  const supabase = await createClient();
  const { data: staffRecords } = await supabase
    .from("staff")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const availableTenants: Array<{ slug: string; name: string | null }> = [];

  if (staffRecords && staffRecords.length > 1) {
    // Only fetch tenant details if user has multiple tenants
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
        // Skip if we can't fetch tenant details (e.g., tenant deleted or RLS issue)
        console.error("Error fetching tenant:", err);
      }
    }
  }

  // User is authenticated and has access - show full layout
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <AdminNav
        tenantSlug={slug}
        user={user}
        owner={owner}
        availableTenants={availableTenants.length > 1 ? availableTenants : []}
      />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
