"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type { Tenant, TenantResponse } from "@/lib/types/tenant";

export async function getCouponsForTenant(tenantSlug: string) {
  try {
    const supabase = await createClient();

    // TODO: we may not need to use a database function here because theres no read RLS on the tenants table
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

/**
 * Resolves tenant slug to tenant data
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

    // Type assertion: Supabase returns the full tenant record
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

/**
 * Submits email for a tenant
 */
export async function submitEmail(tenantSlug: string, email: string) {
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
        success: false,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Insert email into emails table (assuming this table exists)
    // RLS will automatically scope this to the current tenant
    const { error: insertError } = await tenantSupabase.from("emails").insert({
      email,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      return {
        error: `Failed to submit email: ${insertError.message}`,
        success: false,
      };
    }

    return {
      error: null,
      success: true,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An error occurred",
      success: false,
    };
  }
}

/**
 * Submits anonymous feedback for a tenant
 */
export async function submitFeedback(tenantSlug: string) {
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
        success: false,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Insert feedback entry (assuming surveys or feedback table exists)
    // This could just be a click/timestamp for now
    const { error: insertError } = await tenantSupabase.from("surveys").insert({
      tenant_id: tenantId,
      anonymous: true,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      return {
        error: `Failed to submit feedback: ${insertError.message}`,
        success: false,
      };
    }

    return {
      error: null,
      success: true,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An error occurred",
      success: false,
    };
  }
}
