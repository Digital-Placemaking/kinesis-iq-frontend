/**
 * lib/auth/server.ts
 * Server-side authentication utilities.
 * Provides functions for checking business owner status, tenant access, and role-based authorization.
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Business owner role types
 */
export type BusinessOwnerRole = "owner" | "admin" | "staff";

/**
 * Business owner information
 */
export interface BusinessOwner {
  id: string;
  tenant_id: string;
  user_id: string;
  role: BusinessOwnerRole;
  email: string;
  created_at: string;
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Checks if the current user is a business owner for a specific tenant
 * Returns the business owner record if found
 */
export async function getBusinessOwnerForTenant(
  tenantId: string,
  userId?: string
): Promise<BusinessOwner | null> {
  try {
    const supabase = await createClient();

    // Get current user if not provided
    if (!userId) {
      const user = await getCurrentUser();
      if (!user) {
        return null;
      }
      userId = user.id;
    }

    // Query for business owner relationship in staff table
    // This table links auth.users.id to tenants.id
    // If you use a different table name or structure, update this query
    const { data: owner, error } = await supabase
      .from("staff")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .in("role", ["owner", "admin", "staff"])
      .single();

    if (error || !owner) {
      // If staff table doesn't exist, try checking tenants table for owner_id
      // This is a fallback if you link owners directly in tenants table
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("owner_id, id")
        .eq("id", tenantId)
        .single();

      if (!tenantError && tenant?.owner_id === userId) {
        // User is the owner via tenants.owner_id
        return {
          id: userId,
          tenant_id: tenantId,
          user_id: userId,
          role: "owner" as BusinessOwnerRole,
          email: "", // Will need to get from auth.users
          created_at: new Date().toISOString(),
        };
      }

      return null;
    }

    return owner as BusinessOwner;
  } catch (err) {
    console.error("Error checking business owner:", err);
    return null;
  }
}

/**
 * Checks if the current user is a business owner, admin, or staff for a tenant by slug.
 *
 * This function handles both active and inactive tenants. If the `resolve_tenant` RPC
 * fails (e.g., tenant is inactive), it falls back to a direct database lookup.
 * This allows admin/staff users to access tenant admin pages even when the tenant is deactivated.
 *
 * @param tenantSlug - The slug identifier of the tenant
 * @returns Promise resolving to BusinessOwner record if user has access, null otherwise
 */
export async function getBusinessOwnerForTenantSlug(
  tenantSlug: string
): Promise<BusinessOwner | null> {
  try {
    const supabase = await createClient();

    // Resolve tenant slug to UUID
    // Note: resolve_tenant RPC may filter by active=true, so we handle inactive tenants
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      {
        slug_input: tenantSlug,
      }
    );

    let resolvedTenantId = tenantId;

    // If resolve_tenant fails (e.g., tenant is inactive), try direct lookup
    // This allows admin/staff to access even when tenant is deactivated
    if (resolveError || !resolvedTenantId) {
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .maybeSingle();

      if (tenantError || !tenant || !tenant.id) {
        return null;
      }
      resolvedTenantId = tenant.id;
    }

    if (!resolvedTenantId) {
      return null;
    }

    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    return getBusinessOwnerForTenant(resolvedTenantId, user.id);
  } catch (err) {
    console.error("Error checking business owner by slug:", err);
    return null;
  }
}

/**
 * Requires authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

/**
 * Requires business owner access for a tenant
 * Redirects to login or unauthorized page if access denied
 */
export async function requireBusinessOwnerAccess(
  tenantSlug: string,
  redirectTo?: string
) {
  const user = await requireAuth();
  const owner = await getBusinessOwnerForTenantSlug(tenantSlug);

  if (!owner) {
    // Redirect to unauthorized page or login
    redirect(redirectTo || "/admin/login?error=unauthorized");
  }

  return { user, owner };
}

/**
 * Checks if user has required role (owner, admin, or staff)
 */
export function hasRequiredRole(
  owner: BusinessOwner | null,
  requiredRole: BusinessOwnerRole = "staff"
): boolean {
  if (!owner) {
    return false;
  }

  const roleHierarchy: Record<BusinessOwnerRole, number> = {
    owner: 3,
    admin: 2,
    staff: 1,
  };

  return roleHierarchy[owner.role] >= roleHierarchy[requiredRole];
}

/**
 * Checks if user is owner or admin (can edit coupons)
 */
export function isOwnerOrAdmin(owner: BusinessOwner | null): boolean {
  if (!owner) {
    return false;
  }
  return owner.role === "owner" || owner.role === "admin";
}

/**
 * Gets the current user's role for a tenant
 */
export async function getCurrentUserRole(
  tenantSlug: string
): Promise<BusinessOwnerRole | null> {
  const owner = await getBusinessOwnerForTenantSlug(tenantSlug);
  return owner?.role || null;
}
