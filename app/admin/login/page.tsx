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
import Card from "@/app/components/ui/Card";
import { Building2 } from "lucide-react";
import SignOutButton from "./components/SignOutButton";

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

    // User is authenticated but has no staff records (new user not yet added to any tenant)
    // Show helpful message instead of login form
    if (user && !error) {
      return (
        <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="w-full max-w-md">
              <Card className="p-8" variant="elevated">
                <div className="mb-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
                    Account Created
                  </h1>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Your account has been created successfully.
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-amber-600 dark:text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        Access Pending
                      </h3>
                      <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                        Your account is ready, but you haven't been added to any
                        pilot yet. Please contact the pilot owner or
                        administrator to grant you access.
                      </p>
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                        Once you've been added to a pilot, you'll be able to
                        access the admin dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <SignOutButton />
                </div>
              </Card>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
  }

  // Show login form if not authenticated
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
