/**
 * Coupons admin page
 * Manage promotional coupons for the tenant
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

  // Find user's tenant
  const { data: staff } = await supabase
    .from("staff")
    .select("tenant_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!staff || staff.length === 0) {
    redirect("/admin/login?error=no_tenant");
  }

  const tenantId = staff[0].tenant_id;
  const tenantSupabase = await createTenantClient(tenantId);

  // Fetch coupons
  const { data: coupons } = await tenantSupabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Coupon Management
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create and manage promotional coupons for your customers
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
        />
      </div>
    </AdminLayout>
  );
}
