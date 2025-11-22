/**
 * app/admin/login/page.tsx
 * Admin login and tenant selection page.
 * Handles authentication flow and allows users to select which tenant to access.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import AdminLoginForm from "./components/AdminLoginForm";
import TenantSelection from "./components/TenantSelection";
import Footer from "@/app/components/Footer";

interface AdminLoginPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { redirect: redirectPath, error } = await searchParams;

  // Check if user is already authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, show tenant selection
  if (user && !error) {
    // Fetch all tenants the user has access to
    const { data: staffRecords, error: staffError } = await supabase
      .from("staff")
      .select("tenant_id, role, email")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (staffError) {
      console.error("Error fetching staff records:", staffError);
      // Show error on page
    }

    if (staffRecords && staffRecords.length > 0) {
      // Fetch tenant details for each staff record
      const tenants = await Promise.all(
        staffRecords.map(async (staff) => {
          const tenantSupabase = await createTenantClient(staff.tenant_id);
          const { data: tenant } = await tenantSupabase
            .from("tenants")
            .select("id, slug, name, logo_url")
            .eq("id", staff.tenant_id)
            .maybeSingle();

          return tenant
            ? {
                ...tenant,
                role: staff.role,
                staffEmail: staff.email,
              }
            : null;
        })
      );

      const validTenants = tenants.filter((t) => t !== null);

      // If only one tenant and no specific redirect path, redirect directly
      if (validTenants.length === 1 && !redirectPath) {
        redirect(`/${validTenants[0].slug}/admin`);
      }

      // If redirectPath is for a specific tenant and user has access, redirect directly
      if (redirectPath) {
        const redirectMatch = redirectPath.match(/^\/([^/]+)\/admin/);
        if (redirectMatch) {
          const redirectSlug = redirectMatch[1];
          const hasAccess = validTenants.some((t) => t.slug === redirectSlug);
          if (hasAccess) {
            redirect(redirectPath);
          }
        }
      }

      // Show tenant selection
      return (
        <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="w-full max-w-md">
              <TenantSelection
                tenants={validTenants}
                redirectPath={redirectPath}
              />
            </div>
          </div>
          <Footer />
        </div>
      );
    }
  }

  // Show login form if not authenticated or no tenants found
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <AdminLoginForm redirectPath={redirectPath} error={error} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
