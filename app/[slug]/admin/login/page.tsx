/**
 * app/[slug]/admin/login/page.tsx
 * Tenant-specific admin login page.
 * Shows login form for a specific tenant's admin area.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getTenantBySlug } from "@/app/actions/tenant";
import TenantAdminLoginForm from "./components/TenantAdminLoginForm";
import Footer from "@/app/components/Footer";

interface TenantAdminLoginPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function TenantAdminLoginPage({
  params,
  searchParams,
}: TenantAdminLoginPageProps) {
  const { slug } = await params;
  const { error } = await searchParams;

  // Fetch tenant data for display (name and logo)
  const { tenant, error: tenantError } = await getTenantBySlug(slug);
  const tenantName = tenant?.name || slug.toUpperCase();
  const tenantLogo = tenant?.logo_url || null;

  // Check if user is already authenticated
  const user = await getCurrentUser();

  if (user) {
    // User is logged in, check if they have access to this tenant
    const supabase = await createClient();

    // Resolve tenant slug to UUID
    const { data: tenantId } = await supabase.rpc("resolve_tenant", {
      slug_input: slug,
    });

    if (tenantId) {
      // Check if user has access to this tenant
      const { data: staff } = await supabase
        .from("staff")
        .select("tenant_id, role")
        .eq("user_id", user.id)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (staff) {
        // User has access, redirect to admin dashboard
        redirect(`/${slug}/admin`);
      }
    }
  }

  // Show login form for this specific tenant
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
