"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
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

    // Create tenant-scoped client for RLS compliance
    const tenantSupabase = await createTenantClient(tenantId);

    // Insert analytics event
    const { data: event, error: insertError } = await tenantSupabase
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
