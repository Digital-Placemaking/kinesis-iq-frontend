"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { RATE_LIMITS } from "@/lib/constants/rate-limits";
import { checkRateLimit, getClientIdentifier } from "@/lib/utils/rate-limit";

/**
 * Feedback Actions
 * Server actions for feedback submission
 */

/**
 * Submits anonymous feedback for a tenant
 * NOTE: This is a placeholder implementation
 * Rate limited to prevent abuse
 */
export async function submitFeedback(tenantSlug: string) {
  try {
    // Rate limiting: use IP address as identifier (anonymous feedback)
    const headersList = await headers();
    const identifier = getClientIdentifier(null, headersList);
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.GENERAL);

    if (!rateLimit.allowed) {
      return {
        error: `Too many requests. Please try again in ${Math.ceil(
          (rateLimit.resetAt - Date.now()) / 1000
        )} seconds.`,
        success: false,
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
