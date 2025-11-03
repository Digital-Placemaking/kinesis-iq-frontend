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
 * Submits email for a tenant (stores in email_opt_ins table)
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
    // RLS will automatically scope this to the current tenant via current_tenant_id()
    const tenantSupabase = await createTenantClient(tenantId);

    // Insert email into email_opt_ins table
    // RLS policy eoi_insert_current_tenant ensures tenant_id = current_tenant_id()
    // Unique constraint prevents duplicate emails per tenant
    const { error: insertError } = await tenantSupabase
      .from("email_opt_ins")
      .insert({
        email,
        tenant_id: tenantId,
        consent_at: new Date().toISOString(),
      });

    if (insertError) {
      // Handle duplicate email gracefully (unique constraint violation)
      if (
        insertError.code === "23505" ||
        insertError.message?.includes("unique")
      ) {
        return {
          error: null,
          success: true,
          message: "Email already registered",
        };
      }
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
 * Submits email opt-in after social login (Apple/Google)
 * This is called after successful authentication
 */
export async function submitEmailOptIn(tenantSlug: string, email: string) {
  // Same logic as submitEmail - ensures consistency
  return submitEmail(tenantSlug, email);
}

/**
 * Verifies that an email has opted in for this tenant
 * Checks if email exists in email_opt_ins table for the tenant
 */
export async function verifyEmailOptIn(
  tenantSlug: string,
  email: string
): Promise<{ valid: boolean; error?: string }> {
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
        valid: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Verify email exists in email_opt_ins for this tenant
    // RLS will automatically scope this query to current tenant
    const { data: optIn, error: optInError } = await tenantSupabase
      .from("email_opt_ins")
      .select("email")
      .eq("email", email)
      .single();

    if (optInError || !optIn) {
      return {
        valid: false,
        error: "Email opt-in not found",
      };
    }

    return {
      valid: true,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "An error occurred",
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
