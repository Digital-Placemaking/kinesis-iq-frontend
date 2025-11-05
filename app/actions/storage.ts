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
 */
export async function uploadLogoImage(
  tenantSlug: string,
  file: File
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
        url: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Get existing logo URL to delete old file if it exists
    const { data: existingTenant } = await tenantSupabase
      .from("tenants")
      .select("logo_url")
      .eq("id", tenantId)
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
    const fileName = `${tenantId}/${timestamp}_${random}.${fileExt}`;

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
        tenantId,
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
