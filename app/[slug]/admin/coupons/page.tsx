/**
 * app/[slug]/admin/coupons/page.tsx
 * Coupons admin page.
 * Allows administrators to manage promotional coupons for their tenant.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireBusinessOwnerAccess } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import CouponTabs from "./components/CouponTabs";

interface CouponsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CouponsPage({ params }: CouponsPageProps) {
  const { slug } = await params;

  // Require business owner access
  const { user, owner } = await requireBusinessOwnerAccess(
    slug,
    `/${slug}/admin/login?error=unauthorized`
  );

  const supabase = await createClient();

  // Resolve tenant slug to UUID
  const { data: tenantId } = await supabase.rpc("resolve_tenant", {
    slug_input: slug,
  });

  if (!tenantId) {
    redirect(`/${slug}/admin/login?error=tenant_not_found`);
  }

  const userRole = owner.role;
  const canEditCoupons = userRole === "owner" || userRole === "admin";
  const tenantSupabase = await createTenantClient(tenantId);

  // Fetch coupons
  const { data: coupons } = await tenantSupabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
          {canEditCoupons ? "Coupon Management" : "Issued Coupons"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          {canEditCoupons
            ? "Create and manage promotional coupons for your customers"
            : "View and redeem issued coupons"}
        </p>
      </div>
      <CouponTabs
        coupons={coupons || []}
        tenantSlug={slug}
        canEditCoupons={canEditCoupons}
      />
    </div>
  );
}
