/**
 * lib/analytics/track.ts
 * Analytics event tracking utilities.
 * Provides server-side functions for tracking user events and analytics data.
 */

"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  EventType,
  AnalyticsEventMetadata,
  TrackEventResponse,
} from "@/lib/types/analytics";

/**
 * Analytics Tracking
 * Main function to record analytics events in the database
 *
 * This function is specifically for action tracking and should be called
 * whenever a user action needs to be tracked for analytics purposes.
 *
 * All tracking is non-blocking - errors are logged but don't break user flow.
 *
 * Uses admin client to bypass RLS, which is safe because:
 * - This is server-side only (server action)
 * - Tenant ID is validated before insert
 * - Analytics events are not sensitive data
 */
export async function trackEvent(
  tenantSlug: string,
  eventType: EventType,
  options: {
    sessionId?: string | null;
    email?: string | null;
    metadata?: AnalyticsEventMetadata | null;
  } = {}
): Promise<TrackEventResponse> {
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
      console.error("Failed to resolve tenant for analytics tracking:", {
        error: resolveError,
        slug: tenantSlug,
        eventType,
      });
      return {
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
        eventId: null,
      };
    }

    // Use admin client to bypass RLS for analytics inserts
    // This is safe because we validate tenant_id and this is server-side only
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch (err) {
      // If service role key is not configured, fall back to regular client
      // This allows the app to work in development without service role key
      console.warn(
        "SUPABASE_SERVICE_ROLE_KEY not configured, using regular client for analytics (may fail due to RLS)"
      );
      const { createTenantClient } = await import(
        "@/lib/supabase/tenant-client"
      );
      adminClient = await createTenantClient(tenantId);
    }

    // Insert analytics event
    const { data: event, error: insertError } = await adminClient
      .from("analytics_events")
      .insert({
        tenant_id: tenantId,
        event_type: eventType,
        session_id: options.sessionId || null,
        email: options.email || null,
        metadata: options.metadata || null,
      })
      .select()
      .single();

    if (insertError || !event) {
      console.error("Failed to insert analytics event:", {
        error: insertError,
        message: insertError?.message,
        code: insertError?.code,
        tenantId,
        eventType,
      });
      return {
        success: false,
        error: insertError?.message || "Failed to track event",
        eventId: null,
      };
    }

    return {
      success: true,
      error: null,
      eventId: event.id,
    };
  } catch (err) {
    // Log error but don't throw - tracking failures shouldn't break user flow
    console.error("Unexpected error tracking analytics event:", {
      error: err,
      tenantSlug,
      eventType,
    });
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
      eventId: null,
    };
  }
}
