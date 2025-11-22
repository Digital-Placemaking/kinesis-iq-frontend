/**
 * lib/types/analytics.ts
 * Analytics type definitions.
 * Defines TypeScript types and enums for analytics events and tracking data.
 */
export enum EventType {
  PAGE_VISIT = "page_visit",
  CODE_COPY = "code_copy",
  COUPON_DOWNLOAD = "coupon_download",
  WALLET_ADD = "wallet_add",
  SURVEY_COMPLETION = "survey_completion",
}

/**
 * Metadata structure for analytics events
 * Used for additional context in tracking
 */
export interface AnalyticsEventMetadata {
  coupon_id?: string;
  survey_id?: string;
  issued_coupon_id?: string;
  [key: string]: any;
}

/**
 * Analytics Event record from database
 * Matches the analytics_events table schema
 */
export interface AnalyticsEvent {
  id: string;
  tenant_id: string;
  event_type: EventType;
  session_id: string | null;
  email: string | null;
  metadata: AnalyticsEventMetadata | null;
  created_at: string;
}

/**
 * Response type for tracking events
 */
export interface TrackEventResponse {
  success: boolean;
  error: string | null;
  eventId: string | null;
}
