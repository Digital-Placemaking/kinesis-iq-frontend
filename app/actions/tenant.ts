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

/**
 * Updates the tenant's website URL
 * Requires admin access
 */
export async function updateTenantWebsiteUrl(
  tenantSlug: string,
  websiteUrl: string | null
): Promise<{ success: boolean; error: string | null }> {
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
      console.error("Failed to resolve tenant:", {
        error: resolveError,
        slug: tenantSlug,
      });
      return {
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client for update
    const tenantSupabase = await createTenantClient(tenantId);

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
      .eq("id", tenantId)
      .select();

    if (updateError) {
      console.error("Failed to update tenant website URL:", {
        error: updateError,
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
        tenantId,
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
          tenantId,
          websiteUrl: updateValue,
        }
      );
      return {
        success: false,
        error: "Update blocked - no rows were updated. Check RLS policies.",
      };
    }

    console.log("Successfully updated tenant website URL:", {
      tenantId,
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
