/**
 * Coupons admin page
 * Manage promotional coupons for the tenant
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import AdminLayout from "../components/AdminLayout";
import { Plus } from "lucide-react";
import CouponsClient from "./components/CouponsClient";

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      <CouponsClient
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
    </AdminLayout>
  );
}
