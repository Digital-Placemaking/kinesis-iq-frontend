"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";

/**
 * Coupon Actions
 * Server actions for coupon CRUD operations
 */

/**
 * Fetches a single coupon by ID
 */
export async function getCouponById(
  tenantSlug: string,
  couponId: string
): Promise<{ coupon: any | null; error: string | null }> {
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
        coupon: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch the specific coupon
    const { data: coupon, error: couponError } = await tenantSupabase
      .from("coupons")
      .select("*")
      .eq("id", couponId)
      .single();

    if (couponError || !coupon) {
      return {
        coupon: null,
        error: couponError?.message || "Coupon not found",
      };
    }

    return {
      coupon,
      error: null,
    };
  } catch (err) {
    return {
      coupon: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Fetches all coupons for a tenant
 */
export async function getCouponsForTenant(tenantSlug: string) {
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
 * Creates a new coupon for a tenant
 */
export async function createCoupon(
  tenantSlug: string,
  coupon: {
    title: string;
    description?: string;
    discount?: string | null;
    expires_at?: string | null;
    active?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Resolve tenant
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );
    if (resolveError || !tenantId) {
      return { success: false, error: `Tenant not found: ${tenantSlug}` };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    const insertData: any = {
      tenant_id: tenantId,
      title: coupon.title,
      discount: coupon.discount ?? null,
      expires_at: coupon.expires_at ?? null,
      active: coupon.active ?? true,
    };

    const { error: insertError } = await tenantSupabase
      .from("coupons")
      .insert(insertData);

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Failed to create coupon",
      };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Deletes a coupon by ID for a tenant
 */
export async function deleteCoupon(
  tenantSlug: string,
  couponId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Require auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Resolve tenant
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );
    if (resolveError || !tenantId) {
      return { success: false, error: `Tenant not found: ${tenantSlug}` };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    // Delete (RLS ensures tenant and role)
    const { error: delError } = await tenantSupabase
      .from("coupons")
      .delete()
      .eq("id", couponId);

    if (delError) {
      return {
        success: false,
        error: delError.message || "Failed to delete coupon",
      };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
