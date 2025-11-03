"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";

export async function getCouponsForTenant(tenantSlug: string) {
  try {
    const supabase = await createClient();

    // First, resolve tenant slug to UUID
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      {
        slug_input: tenantSlug,
      }
    );

    if (resolveError || !tenantId) {
      return {
        error: `Tenant not found: ${tenantSlug}`,
        coupons: null,
      };
    }

    // Create tenant-scoped client with x-tenant-id header
    // RLS will automatically read this from request.headers via current_tenant_id()
    const tenantSupabase = await createTenantClient(tenantId);

    // Query directly - no RPC needed! RLS handles tenant isolation
    const { data: coupons, error: couponsError } = await tenantSupabase
      .from("coupons")
      .select("*");

    if (couponsError) {
      return {
        error: `Failed to fetch coupons: ${couponsError.message}`,
        coupons: null,
      };
    }

    return {
      error: null,
      coupons: coupons || [],
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An error occurred",
      coupons: null,
    };
  }
}
