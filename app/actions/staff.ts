"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type { BusinessOwner, BusinessOwnerRole } from "@/lib/auth/server";
import type {
  Staff,
  StaffResponse,
  AddStaffInput,
  AddStaffResponse,
} from "@/lib/types/staff";

/**
 * Staff Actions
 * Server actions for staff management operations
 */

/**
 * Gets all staff members for a tenant
 * Returns staff list with user information
 * Note: This function can work with inactive tenants (for admin access)
 */
export async function getStaffForTenant(
  tenantSlug: string,
  tenantId?: string
): Promise<StaffResponse> {
  try {
    let resolvedTenantId = tenantId;

    // If tenantId is not provided, resolve tenant slug to UUID
    // Note: resolve_tenant RPC may filter by active=true, so we try to handle both cases
    if (!resolvedTenantId) {
      const supabase = await createClient();
      const { data: resolvedId, error: resolveError } = await supabase.rpc(
        "resolve_tenant",
        {
          slug_input: tenantSlug,
        }
      );

      if (resolveError || !resolvedId) {
        // If resolve_tenant fails (e.g., tenant is inactive), try direct lookup
        // This allows admin to access staff even when tenant is deactivated
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenantSlug)
          .maybeSingle();

        if (tenantError || !tenant || !tenant.id) {
          return {
            staff: null,
            error: `Tenant not found: ${tenantSlug}`,
          };
        }
        resolvedTenantId = tenant.id;
      } else {
        resolvedTenantId = resolvedId;
      }
    }

    // At this point, resolvedTenantId must be defined
    if (!resolvedTenantId) {
      return {
        staff: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(resolvedTenantId);

    // Fetch staff members for this tenant
    // This works regardless of tenant active status because we're using tenant-scoped client
    const { data: staff, error: staffError } = await tenantSupabase
      .from("staff")
      .select("*")
      .eq("tenant_id", resolvedTenantId)
      .order("created_at", { ascending: true });

    if (staffError) {
      console.error("Failed to fetch staff:", {
        error: staffError,
        message: staffError.message,
        code: staffError.code,
        tenantId: resolvedTenantId,
      });
      return {
        staff: null,
        error: `Failed to fetch staff: ${staffError.message}`,
      };
    }

    return {
      staff: (staff as Staff[]) || [],
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error fetching staff:", err);
    return {
      staff: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
