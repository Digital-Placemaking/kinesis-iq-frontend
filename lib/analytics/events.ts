/**
 * lib/analytics/events.ts
 * Analytics event helper functions.
 * Provides convenience functions for tracking specific analytics events.
 */

"use server";

import { trackEvent } from "./track";
import { EventType, type AnalyticsEventMetadata } from "@/lib/types/analytics";

/**
 * Analytics Event Tracking Functions
 *
 * These functions are specifically for action tracking and should be called
 * whenever a user action needs to be tracked for analytics purposes.
 *
 * All functions are non-blocking - they fire-and-forget to prevent
 * tracking failures from breaking user flows.
 */

/**
 * Track a page visit
 * Call this when a user visits a tenant landing page
 */
export async function trackPageVisit(
  tenantSlug: string,
  options: {
    sessionId?: string | null;
    email?: string | null;
  } = {}
): Promise<void> {
  // Fire and forget - don't await or block
  trackEvent(tenantSlug, EventType.PAGE_VISIT, {
    sessionId: options.sessionId,
    email: options.email,
  }).catch((err) => {
    console.error("Failed to track page visit:", err);
  });
}

/**
 * Track when a user copies a coupon code
 * Call this when the copy code button is clicked
 */
export async function trackCodeCopy(
  tenantSlug: string,
  options: {
    sessionId?: string | null;
    email?: string | null;
    couponId?: string;
    issuedCouponId?: string;
  } = {}
): Promise<void> {
  const metadata: AnalyticsEventMetadata = {};
  if (options.couponId) metadata.coupon_id = options.couponId;
  if (options.issuedCouponId)
    metadata.issued_coupon_id = options.issuedCouponId;

  // Fire and forget - don't await or block
  trackEvent(tenantSlug, EventType.CODE_COPY, {
    sessionId: options.sessionId,
    email: options.email,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  }).catch((err) => {
    console.error("Failed to track code copy:", err);
  });
}

/**
 * Track when a user downloads a coupon
 * Call this when the download button is clicked
 */
export async function trackCouponDownload(
  tenantSlug: string,
  options: {
    sessionId?: string | null;
    email?: string | null;
    couponId?: string;
    issuedCouponId?: string;
  } = {}
): Promise<void> {
  const metadata: AnalyticsEventMetadata = {};
  if (options.couponId) metadata.coupon_id = options.couponId;
  if (options.issuedCouponId)
    metadata.issued_coupon_id = options.issuedCouponId;

  // Fire and forget - don't await or block
  trackEvent(tenantSlug, EventType.COUPON_DOWNLOAD, {
    sessionId: options.sessionId,
    email: options.email,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  }).catch((err) => {
    console.error("Failed to track coupon download:", err);
  });
}

/**
 * Track when a user adds a coupon to Google Wallet
 * Call this when the wallet add action completes successfully
 */
export async function trackWalletAdd(
  tenantSlug: string,
  options: {
    sessionId?: string | null;
    email?: string | null;
    couponId?: string;
    issuedCouponId?: string;
  } = {}
): Promise<void> {
  const metadata: AnalyticsEventMetadata = {};
  if (options.couponId) metadata.coupon_id = options.couponId;
  if (options.issuedCouponId)
    metadata.issued_coupon_id = options.issuedCouponId;

  // Fire and forget - don't await or block
  trackEvent(tenantSlug, EventType.WALLET_ADD, {
    sessionId: options.sessionId,
    email: options.email,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  }).catch((err) => {
    console.error("Failed to track wallet add:", err);
  });
}

/**
 * Track when a user completes a survey
 * Call this after a survey is successfully submitted
 */
export async function trackSurveyCompletion(
  tenantSlug: string,
  options: {
    sessionId?: string | null;
    email?: string | null;
    surveyId?: string;
    couponId?: string;
  } = {}
): Promise<void> {
  const metadata: AnalyticsEventMetadata = {};
  if (options.surveyId) metadata.survey_id = options.surveyId;
  if (options.couponId) metadata.coupon_id = options.couponId;

  // Fire and forget - don't await or block
  trackEvent(tenantSlug, EventType.SURVEY_COMPLETION, {
    sessionId: options.sessionId,
    email: options.email,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  }).catch((err) => {
    console.error("Failed to track survey completion:", err);
  });
}
