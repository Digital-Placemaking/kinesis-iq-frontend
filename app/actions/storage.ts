"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";

/**
 * Storage Actions
 * Server actions for file uploads to Supabase Storage
 */

/**
 * Uploads an image file to Supabase Storage
 * Returns the public URL of the uploaded file
 * Note: Can work with inactive tenants (for admin access)
 */
export async function uploadLogoImage(
  tenantSlug: string,
  file: File,
  tenantId?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type (only JPEG, PNG, WEBP)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        url: null,
        error: "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: "File size too large. Maximum size is 5MB.",
      };
    }

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
        // This allows admin to upload logos even when tenant is deactivated
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
            url: null,
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
        url: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(resolvedTenantId);

    // Get existing logo URL to delete old file if it exists
    const { data: existingTenant } = await tenantSupabase
      .from("tenants")
      .select("logo_url")
      .eq("id", resolvedTenantId)
      .single();

    // Delete old logo from storage if it exists and is in our bucket
    if (existingTenant?.logo_url) {
      const oldUrl = existingTenant.logo_url;
      // Check if the old logo is from our storage bucket
      if (oldUrl.includes("/storage/v1/object/public/logos/")) {
        // Extract file path from URL: .../logos/{tenantId}/filename.ext
        const urlParts = oldUrl.split("/logos/");
        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1];
          // Try to delete old file (ignore errors if it doesn't exist)
          await tenantSupabase.storage
            .from("logos")
            .remove([oldFilePath])
            .catch(() => {
              // Ignore deletion errors - file might not exist
            });
        }
      }
    }

    // Generate unique filename: tenant-id_timestamp_random.ext
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split(".").pop();
    const fileName = `${resolvedTenantId}/${timestamp}_${random}.${fileExt}`;

    // Convert File to ArrayBuffer (for Node.js Buffer)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage bucket "logos"
    // Note: We use tenantSupabase here to ensure tenant context is set
    // The storage bucket policies will verify the user has owner/admin role
    const { data, error: uploadError } = await tenantSupabase.storage
      .from("logos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
        cacheControl: "3600", // Cache for 1 hour
      });

    if (uploadError) {
      console.error("Failed to upload logo:", {
        error: uploadError,
        message: uploadError.message,
        fileName,
        tenantId: resolvedTenantId,
      });
      return {
        url: null,
        error: `Failed to upload image: ${uploadError.message}`,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = tenantSupabase.storage.from("logos").getPublicUrl(fileName);

    return {
      url: publicUrl,
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error uploading logo:", err);
    return {
      url: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Uploads a coupon image file to Supabase Storage
 * Returns the public URL of the uploaded file
 */
export async function uploadCouponImage(
  tenantSlug: string,
  file: File,
  tenantId?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type (only JPEG, PNG, WEBP)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        url: null,
        error: "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: "File size too large. Maximum size is 5MB.",
      };
    }

    let resolvedTenantId = tenantId;

    // If tenantId is provided, use it directly (bypasses slug resolution)
    if (!resolvedTenantId) {
      const supabase = await createClient();

      const { data: resolvedId, error: resolveError } = await supabase.rpc(
        "resolve_tenant",
        {
          slug_input: tenantSlug,
        }
      );

      if (resolveError || !resolvedId) {
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenantSlug)
          .maybeSingle();

        if (tenantError || !tenant || !tenant.id) {
          return {
            url: null,
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
        url: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(resolvedTenantId);

    // Generate unique filename: tenant-id_timestamp_random.ext
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split(".").pop();
    const fileName = `${resolvedTenantId}/${timestamp}_${random}.${fileExt}`;

    // Convert File to ArrayBuffer (for Node.js Buffer)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage bucket "coupon_assets"
    const { data, error: uploadError } = await tenantSupabase.storage
      .from("coupon_assets")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Failed to upload coupon image:", {
        error: uploadError,
        message: uploadError.message,
        fileName,
        tenantId: resolvedTenantId,
      });
      return {
        url: null,
        error: `Failed to upload image: ${uploadError.message}`,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = tenantSupabase.storage.from("coupon_assets").getPublicUrl(fileName);

    return {
      url: publicUrl,
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error uploading coupon image:", err);
    return {
      url: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
