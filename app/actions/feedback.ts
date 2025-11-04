"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";

/**
 * Feedback Actions
 * Server actions for feedback submission
 */

/**
 * Submits anonymous feedback for a tenant
 * NOTE: This is a placeholder implementation
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
