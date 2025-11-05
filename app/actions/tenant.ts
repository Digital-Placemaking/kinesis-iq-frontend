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
 * Note: Can work with inactive tenants (for admin access)
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
        "id, slug, name, logo_url, website_url, theme, active, created_at"
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
 * Updates the tenant's settings
 * Requires owner/admin access
 * Note: Can work with inactive tenants (for admin access)
 */
export async function updateTenantSettings(
  tenantSlug: string,
  updates: {
    name?: string;
    logo_url?: string | null;
    active?: boolean;
  },
  tenantId?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // If tenantId is provided, use it directly (bypasses slug resolution)
    // This is the preferred method for admin operations on inactive tenants
    if (tenantId) {
      console.log("Using provided tenantId, skipping slug resolution:", {
        tenantId,
        tenantSlug,
        updates,
      });
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

    console.log("Updating tenant with resolvedTenantId:", {
      resolvedTenantId,
      tenantSlug,
      updates,
    });

    // Create tenant-scoped client for update
    const tenantSupabase = await createTenantClient(resolvedTenantId);

    // Prepare update data
    const updateData: any = {};
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
        }
      );
      return {
        success: false,
        error: "Update blocked - no rows were updated. Check RLS policies.",
      };
    }

    console.log("Successfully updated tenant settings:", {
      tenantId: resolvedTenantId,
      updates: updateData,
    });

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

    console.log("Successfully updated tenant website URL:", {
      tenantId: resolvedTenantId,
      websiteUrl: updateValue,
      updatedData: data[0],
    });

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
