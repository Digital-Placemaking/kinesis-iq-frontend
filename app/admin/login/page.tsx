/**
 * Admin login page
 * Handles authentication flow for tenant administrators
 * Redirects authenticated users to dashboard if no errors present
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLoginForm from "./components/AdminLoginForm";

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

  // If already logged in and there's no error, redirect to dashboard
  // But if there's an error (like no_tenant), show the error instead of redirecting
  if (user && !error) {
    // Try to find their tenant(s) and redirect to first one's admin
    const { data: staff } = await supabase
      .from("staff")
      .select("tenant_id")
      .eq("user_id", user.id)
      .limit(1);

    if (staff && staff.length > 0) {
      // Use tenant-scoped client to query tenant (RLS may block regular client)
      const { createTenantClient } = await import(
        "@/lib/supabase/tenant-client"
      );
      const tenantSupabase = await createTenantClient(staff[0].tenant_id);

      const { data: tenant, error: tenantError } = await tenantSupabase
        .from("tenants")
        .select("slug")
        .eq("id", staff[0].tenant_id)
        .maybeSingle();

      if (tenantError) {
        console.error("Error fetching tenant in login page:", tenantError);
        // Don't redirect, show error on page
      } else if (tenant) {
        redirect("/admin");
      }
    }

    // If no tenant found but user is logged in, show error on login page
    // Don't redirect - that would create a loop
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4">
      <div className="w-full max-w-md">
        <AdminLoginForm redirectPath={redirectPath} error={error} />
      </div>
    </div>
  );
}
