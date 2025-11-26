/**
 * app/actions/tenant.ts
 * Server actions for tenant-related operations.
 * Handles tenant fetching, settings updates, and subdomain resolution.
 */

"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type { Tenant, TenantResponse } from "@/lib/types/tenant";
import { isReservedSubdomain } from "@/lib/constants/subdomains";
import { checkRateLimit, getClientIdentifier } from "@/lib/utils/rate-limit";
import { RATE_LIMITS } from "@/lib/constants/rate-limits";

/**
 * Tenant Actions
 * Server actions for tenant-related operations
 */

/**
 * Fetches a tenant by slug.
 *
 * This function handles both active and inactive tenants. If the `resolve_tenant` RPC
 * fails (e.g., tenant is inactive), it falls back to a direct database lookup.
 * This allows admin/staff users to access tenant data even when the tenant is deactivated.
 *
 * @param tenantSlug - The slug identifier of the tenant
 * @returns Promise resolving to a TenantResponse containing the tenant data or an error
 */
export async function getTenantBySlug(
  tenantSlug: string
): Promise<TenantResponse> {
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

    if (resolveError || !resolvedTenantId) {
      // If resolve_tenant fails (e.g., tenant is inactive), try direct lookup
      // This allows fetching tenant data even when tenant is deactivated
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .maybeSingle();

      if (tenantError || !tenant || !tenant.id) {
        return {
          error: `Tenant not found: ${tenantSlug}`,
          tenant: null,
        };
      }
      resolvedTenantId = tenant.id;
    }

    // Fetch tenant data using tenant-scoped client
    // Explicitly select logo_url to ensure it's included
    // Note: We don't filter by active=true here - caller should check if needed
    const tenantSupabase = await createTenantClient(resolvedTenantId);
    const { data: tenant, error: tenantError } = await tenantSupabase
      .from("tenants")
      .select(
        "id, slug, subdomain, name, logo_url, website_url, theme, active, created_at"
      )
      .eq("id", resolvedTenantId)
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

/**
 * Fetches a tenant by subdomain.
 *
 * This function handles both active and inactive tenants. If the `resolve_tenant_by_subdomain` RPC
 * fails (e.g., tenant is inactive), it falls back to a direct database lookup.
 * This allows admin/staff users to access tenant data even when the tenant is deactivated.
 *
 * @param tenantSubdomain - The subdomain identifier of the tenant
 * @returns Promise resolving to a TenantResponse containing the tenant data or an error
 */
export async function getTenantBySubdomain(
  tenantSubdomain: string
): Promise<TenantResponse> {
  try {
    const supabase = await createClient();

    // Resolve tenant subdomain to UUID
    // Note: resolve_tenant_by_subdomain RPC may filter by active=true, so we handle inactive tenants
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant_by_subdomain",
      {
        subdomain_input: tenantSubdomain,
      }
    );

    let resolvedTenantId = tenantId;

    if (resolveError || !resolvedTenantId) {
      // If resolve_tenant_by_subdomain fails (e.g., tenant is inactive), try direct lookup
      // This allows fetching tenant data even when tenant is deactivated
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id")
        .eq("subdomain", tenantSubdomain)
        .maybeSingle();

      if (tenantError || !tenant || !tenant.id) {
        return {
          error: `Tenant not found: ${tenantSubdomain}`,
          tenant: null,
        };
      }
      resolvedTenantId = tenant.id;
    }

    // Fetch tenant data using tenant-scoped client
    // Note: We don't filter by active=true here - caller should check if needed
    const tenantSupabase = await createTenantClient(resolvedTenantId);
    const { data: tenant, error: tenantError } = await tenantSupabase
      .from("tenants")
      .select(
        "id, slug, subdomain, name, logo_url, website_url, theme, active, created_at"
      )
      .eq("id", resolvedTenantId)
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

/**
 * Updates the tenant's settings.
 *
 * Requires owner/admin access. This function can work with inactive tenants (for admin access).
 * If `tenantId` is provided, it bypasses slug resolution, which is preferred for admin operations
 * on inactive tenants.
 *
 * @param tenantSlug - The slug identifier of the tenant
 * @param updates - Object containing the fields to update (name, logo_url, active, subdomain, background_url)
 * @param tenantId - Optional tenant ID to bypass slug resolution (preferred for inactive tenants)
 * @returns Promise resolving to an object with success status and optional error message
 */
export async function updateTenantSettings(
  tenantSlug: string,
  updates: {
    name?: string;
    logo_url?: string | null;
    active?: boolean;
    subdomain?: string | null;
    background_url?: string | null;
  },
  tenantId?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // If tenantId is provided, use it directly (bypasses slug resolution)
    // This is the preferred method for admin operations on inactive tenants
    if (tenantId) {
      // Using provided tenantId, skipping slug resolution
    }

    let resolvedTenantId = tenantId;

    // Only resolve slug if tenantId was not provided
    if (!resolvedTenantId) {
      const supabase = await createClient();

      // If tenantId is not provided, resolve tenant slug to UUID
      // Note: resolve_tenant RPC may filter by active=true, so we handle inactive tenants
      const { data: resolvedId, error: resolveError } = await supabase.rpc(
        "resolve_tenant",
        {
          slug_input: tenantSlug,
        }
      );

      if (resolveError || !resolvedId) {
        // If resolve_tenant fails (e.g., tenant is inactive), try direct lookup
        // This allows admin to update settings even when tenant is deactivated
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenantSlug)
          .maybeSingle();

        if (tenantError || !tenant || !tenant.id) {
          console.error("Failed to resolve tenant:", {
            error: resolveError || tenantError,
            slug: tenantSlug,
          });
          return {
            success: false,
            error: `Tenant not found: ${tenantSlug}`,
          };
        }
        resolvedTenantId = tenant.id;
      } else {
        resolvedTenantId = resolvedId;
      }
    }

    if (!resolvedTenantId) {
      return {
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Updating tenant with resolvedTenantId

    // Create tenant-scoped client for update
    const tenantSupabase = await createTenantClient(resolvedTenantId);

    // Prepare update data
    const updateData: {
      name?: string;
      logo_url?: string | null;
      website_url?: string | null;
      theme?: { primary: string; secondary: string } | null;
      active?: boolean;
      subdomain?: string | null;
    } = {};
    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        return {
          success: false,
          error: "Business name cannot be empty",
        };
      }
      updateData.name = updates.name.trim();
    }
    if (updates.logo_url !== undefined) {
      updateData.logo_url = updates.logo_url?.trim() || null;
    }
    if (updates.active !== undefined) {
      updateData.active = updates.active;
    }
    if (updates.subdomain !== undefined) {
      const subdomainValue = updates.subdomain?.trim() || null;

      // Get current tenant to check if subdomain is actually changing
      // Reuse the tenantSupabase client created above
      const { data: currentTenant } = await tenantSupabase
        .from("tenants")
        .select("subdomain")
        .eq("id", resolvedTenantId)
        .single();

      const currentSubdomain = currentTenant?.subdomain || null;
      const isSubdomainChanging = subdomainValue !== currentSubdomain;

      // Only apply rate limiting if subdomain is actually changing
      if (isSubdomainChanging) {
        // Rate limiting: use tenant ID as identifier (unique per tenant)
        const headersList = await headers();
        const identifier = `tenant:${resolvedTenantId}`;
        const rateLimit = await checkRateLimit(
          identifier,
          RATE_LIMITS.SUBDOMAIN_CHANGE
        );

        if (!rateLimit.allowed) {
          const hoursUntilReset = Math.ceil(
            (rateLimit.resetAt - Date.now()) / (1000 * 60 * 60)
          );
          return {
            success: false,
            error: `Subdomain can only be changed once per day. Please try again in ${hoursUntilReset} hour${
              hoursUntilReset !== 1 ? "s" : ""
            }.`,
          };
        }
      }

      // Validate subdomain format if provided
      if (subdomainValue) {
        // Subdomain must be lowercase alphanumeric with hyphens, 3-63 characters
        const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
        if (!subdomainRegex.test(subdomainValue)) {
          return {
            success: false,
            error:
              "Subdomain must be 3-63 characters, lowercase alphanumeric with hyphens only, and cannot start or end with a hyphen",
          };
        }

        // Check for reserved subdomains
        if (isReservedSubdomain(subdomainValue)) {
          return {
            success: false,
            error: `Subdomain "${subdomainValue}" is reserved and cannot be used`,
          };
        }

        // Check for uniqueness (excluding current tenant)
        const supabase = await createClient();
        const { data: existingTenant, error: checkError } = await supabase
          .from("tenants")
          .select("id")
          .eq("subdomain", subdomainValue)
          .neq("id", resolvedTenantId)
          .maybeSingle();

        if (checkError) {
          console.error("Error checking subdomain uniqueness:", checkError);
          return {
            success: false,
            error: "Failed to validate subdomain uniqueness",
          };
        }

        if (existingTenant) {
          return {
            success: false,
            error: `Subdomain "${subdomainValue}" is already taken by another tenant`,
          };
        }
      }

      updateData.subdomain = subdomainValue;
    }

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: "No updates provided",
      };
    }

    // Update tenant settings
    const { data, error: updateError } = await tenantSupabase
      .from("tenants")
      .update(updateData)
      .eq("id", resolvedTenantId)
      .select();

    if (updateError) {
      console.error("Failed to update tenant settings:", {
        error: updateError,
        message: updateError.message,
        code: updateError.code,
        tenantId: resolvedTenantId,
        updates: updateData,
      });

      // Handle duplicate subdomain error with user-friendly message
      if (
        updateError.code === "23505" ||
        updateError.message?.includes("tenants_subdomain_idx") ||
        updateError.message?.includes("unique constraint") ||
        updateError.message?.includes("duplicate key")
      ) {
        return {
          success: false,
          error: "This subdomain is already taken. Please try another.",
        };
      }

      return {
        success: false,
        error: `Failed to update settings: ${updateError.message}`,
      };
    }

    // Check if any rows were updated (RLS might block silently)
    if (!data || data.length === 0) {
      console.error(
        "Update blocked - no rows were updated. Check RLS policies:",
        {
          tenantId: resolvedTenantId,
          updates: updateData,
          activeValue: updates.active,
        }
      );
      return {
        success: false,
        error:
          "Update blocked - no rows were updated. This may be due to RLS policies or the tenant not being found.",
      };
    }

    // Successfully updated tenant settings

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error updating tenant settings:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Updates the tenant's website URL
 * Requires admin access
 * Note: Can work with inactive tenants (for admin access)
 */
export async function updateTenantWebsiteUrl(
  tenantSlug: string,
  websiteUrl: string | null,
  tenantId?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    let resolvedTenantId = tenantId;

    // If tenantId is provided, use it directly (bypasses slug resolution)
    // This is the preferred method for admin operations on inactive tenants
    if (!resolvedTenantId) {
      const supabase = await createClient();

      // If tenantId is not provided, resolve tenant slug to UUID
      // Note: resolve_tenant RPC may filter by active=true, so we handle inactive tenants
      const { data: resolvedId, error: resolveError } = await supabase.rpc(
        "resolve_tenant",
        {
          slug_input: tenantSlug,
        }
      );

      if (resolveError || !resolvedId) {
        // If resolve_tenant fails (e.g., tenant is inactive), try direct lookup
        // This allows admin to update website URL even when tenant is deactivated
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenantSlug)
          .maybeSingle();

        if (tenantError || !tenant || !tenant.id) {
          console.error("Failed to resolve tenant:", {
            error: resolveError || tenantError,
            slug: tenantSlug,
          });
          return {
            success: false,
            error: `Tenant not found: ${tenantSlug}`,
          };
        }
        resolvedTenantId = tenant.id;
      } else {
        resolvedTenantId = resolvedId;
      }
    }

    if (!resolvedTenantId) {
      return {
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client for update
    const tenantSupabase = await createTenantClient(resolvedTenantId);

    // Validate URL format if provided
    if (websiteUrl && websiteUrl.trim()) {
      const url = websiteUrl.trim();
      // Check if it's a valid URL (http/https) or a relative path
      if (
        !url.startsWith("http://") &&
        !url.startsWith("https://") &&
        !url.startsWith("/")
      ) {
        return {
          success: false,
          error:
            "Website URL must be a valid URL (http:// or https://) or a relative path (starting with /)",
        };
      }
    }

    // Prepare the update value
    const updateValue = websiteUrl?.trim() || null;

    // Update tenant website URL
    const { data, error: updateError } = await tenantSupabase
      .from("tenants")
      .update({ website_url: updateValue })
      .eq("id", resolvedTenantId)
      .select();

    if (updateError) {
      console.error("Failed to update tenant website URL:", {
        error: updateError,
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
        tenantId: resolvedTenantId,
        websiteUrl: updateValue,
      });
      return {
        success: false,
        error: `Failed to update website URL: ${updateError.message}`,
      };
    }

    // Check if any rows were updated (RLS might block silently)
    if (!data || data.length === 0) {
      console.error(
        "Update blocked - no rows were updated. Check RLS policies:",
        {
          tenantId: resolvedTenantId,
          websiteUrl: updateValue,
        }
      );
      return {
        success: false,
        error: "Update blocked - no rows were updated. Check RLS policies.",
      };
    }

    // Successfully updated tenant website URL

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error updating tenant website URL:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
