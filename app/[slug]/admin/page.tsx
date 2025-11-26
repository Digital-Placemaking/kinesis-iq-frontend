/**
 * app/[slug]/admin/page.tsx
 * Unified tenant-specific admin page.
 * Loads all admin section data and renders client-side tab switching.
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getBusinessOwnerForTenantSlug } from "@/lib/auth/server";
import { getTenantBySlug } from "@/app/actions";
import TenantAdminLoginForm from "./login/components/TenantAdminLoginForm";
import Footer from "@/app/components/Footer";
import { Suspense } from "react";
import AdminLoading from "./components/AdminLoading";
import AdminPageContent from "./components/AdminPageContent";

interface AdminDashboardProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; tab?: string }>;
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

  // If no access, show login form with helpful error message
  if (!owner) {
    // If user is authenticated but doesn't have access, show a more helpful message
    if (user) {
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
    // If not authenticated, show login form without error (they need to log in first)
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

  // Render admin content with loading state
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminPageContent slug={slug} user={user} owner={owner} />
    </Suspense>
  );
}
