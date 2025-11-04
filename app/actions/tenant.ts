"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type { Tenant, TenantResponse } from "@/lib/types/tenant";

/**
 * Tenant Actions
 * Server actions for tenant-related operations
 */

/**
 * Fetches a tenant by slug
 */
export async function getTenantBySlug(
  tenantSlug: string
): Promise<TenantResponse> {
  try {
    const supabase = await createClient();

    // Resolve tenant slug to UUID
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      {
        slug_input: tenantSlug,
      }
    );

    if (resolveError || !tenantId) {
      return {
        error: `Tenant not found: ${tenantSlug}`,
        tenant: null,
      };
    }

    // Fetch tenant data using tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);
    const { data: tenant, error: tenantError } = await tenantSupabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .eq("active", true)
      .single();

    if (tenantError || !tenant) {
      return {
        error: `Failed to fetch tenant data: ${tenantError?.message}`,
        tenant: null,
      };
    }

    return {
      error: null,
      tenant: tenant as Tenant,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An error occurred",
      tenant: null,
    };
  }
}
