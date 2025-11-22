/**
 * app/admin/coupons/page.tsx
 * Coupons admin page.
 * Allows administrators to manage promotional coupons for their tenant.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import AdminLayout from "../components/AdminLayout";
import CouponTabs from "./components/CouponTabs";

export default async function CouponsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Find user's tenant and role
  const { data: staff } = await supabase
    .from("staff")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!staff || staff.length === 0) {
    redirect("/admin/login?error=no_tenant");
  }

  const tenantId = staff[0].tenant_id;
  const userRole = staff[0].role;
  const canEditCoupons = userRole === "owner" || userRole === "admin";
  const tenantSupabase = await createTenantClient(tenantId);

  // Fetch coupons
  const { data: coupons } = await tenantSupabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminLayout userRole={userRole}>
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
          tenantSlug={
            (
              await tenantSupabase
                .from("tenants")
                .select("slug")
                .eq("id", tenantId)
                .maybeSingle()
            ).data?.slug || ""
          }
          canEditCoupons={canEditCoupons}
        />
      </div>
    </AdminLayout>
  );
}
