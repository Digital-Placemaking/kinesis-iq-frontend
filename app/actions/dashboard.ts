/**
 * app/actions/dashboard.ts
 * Server actions for dashboard overview page.
 * Handles fetching Community Pulse Dashboard metrics.
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { EventType } from "@/lib/types/analytics";

export interface DashboardMetrics {
  totalResponses: number;
  uniqueSessions: number;
  happinessScore: number; // Percentage
  happyResponses: number;
  pageVisits: number;
  conversionRate: number; // Percentage
  engagement: number; // Copy/download actions
  topCoupon: {
    name: string;
    count: number;
  } | null;
  sentimentDistribution: {
    happy: number;
    neutral: number;
    concerned: number;
  };
  engagementFunnel: {
    pageVisits: number;
    surveyResponses: number;
    copyCodeClicks: number;
    downloadWallet: number;
  };
  error: string | null;
}

/**
 * Get Community Pulse Dashboard metrics.
 *
 * Returns all metrics needed for the overview dashboard, including:
 * - Total responses and unique sessions
 * - Happiness score and sentiment distribution
 * - Page visits and conversion rate
 * - Engagement metrics (copy, download, wallet)
 * - Top coupon information
 *
 * This function handles both active and inactive tenants. If the `resolve_tenant` RPC
 * fails (e.g., tenant is inactive), it falls back to a direct database lookup.
 *
 * @param tenantSlug - The slug identifier of the tenant
 * @returns Promise resolving to DashboardMetrics containing all dashboard data
 */
export async function getDashboardMetrics(
  tenantSlug: string
): Promise<DashboardMetrics> {
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

    // If resolve_tenant fails (e.g., tenant is inactive), try direct lookup
    // This allows admin/staff to access even when tenant is deactivated
    if (resolveError || !resolvedTenantId) {
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .maybeSingle();

      if (tenantError || !tenant || !tenant.id) {
        return {
          totalResponses: 0,
          uniqueSessions: 0,
          happinessScore: 0,
          happyResponses: 0,
          pageVisits: 0,
          conversionRate: 0,
          engagement: 0,
          topCoupon: null,
          sentimentDistribution: {
            happy: 0,
            neutral: 0,
            concerned: 0,
          },
          engagementFunnel: {
            pageVisits: 0,
            surveyResponses: 0,
            copyCodeClicks: 0,
            downloadWallet: 0,
          },
          error: `Tenant not found: ${tenantSlug}`,
        };
      }
      resolvedTenantId = tenant.id;
    }

    if (!resolvedTenantId) {
      return {
        totalResponses: 0,
        uniqueSessions: 0,
        happinessScore: 0,
        happyResponses: 0,
        pageVisits: 0,
        conversionRate: 0,
        engagement: 0,
        topCoupon: null,
        sentimentDistribution: {
          happy: 0,
          neutral: 0,
          concerned: 0,
        },
        engagementFunnel: {
          pageVisits: 0,
          surveyResponses: 0,
          copyCodeClicks: 0,
          downloadWallet: 0,
        },
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(resolvedTenantId);

    // Fetch all data in parallel
    const [
      surveyResponsesData,
      analyticsData,
      issuedCouponsData,
      pulseQuestionsData,
    ] = await Promise.all([
      // Survey responses: Get all responses to count total and unique sessions
      tenantSupabase
        .from("survey_responses")
        .select("session_id, question_id, answer"),

      // Analytics events: Get page visits, copy code, download, wallet events
      tenantSupabase
        .from("analytics_events")
        .select("event_type, session_id, email")
        .in("event_type", [
          EventType.PAGE_VISIT,
          EventType.SURVEY_COMPLETION,
          EventType.CODE_COPY,
          EventType.COUPON_DOWNLOAD,
          EventType.WALLET_ADD,
        ]),

      // Issued coupons: Get coupon counts grouped by coupon_id
      tenantSupabase
        .from("issued_coupons")
        .select("coupon_id, id")
        .eq("status", "issued"),

      // Pulse / sentiment-like question types for the donut chart
      tenantSupabase
        .from("survey_questions")
        .select("id, type")
        .in("type", [
          "sentiment",
          "nps",
          "likert_5",
          "likert_7",
          "rating_5",
        ]),
    ]);

    if (pulseQuestionsData.error) {
      console.error(
        "Failed to load survey_questions for sentiment:",
        pulseQuestionsData.error.message
      );
    }

    // Calculate total responses and unique sessions
    const totalResponses = surveyResponsesData.data?.length || 0;
    const uniqueSessions = new Set(
      surveyResponsesData.data?.map((r) => r.session_id).filter(Boolean) || []
    ).size;

    const questionTypeById = new Map<string, string>(
      (pulseQuestionsData.data ?? []).map((q) => [q.id as string, q.type as string])
    );

    let happyCount = 0;
    let neutralCount = 0;
    let concernedCount = 0;

    const extractAnswerNumber = (answer: unknown): number | null => {
      if (answer == null) return null;
      if (typeof answer === "number" && Number.isFinite(answer)) return answer;
      if (typeof answer === "string") {
        const n = Number(answer);
        return Number.isFinite(n) ? n : null;
      }
      if (typeof answer === "object") {
        const record = answer as Record<string, unknown>;
        if (record.number !== undefined && record.number !== null) {
          const n = Number(record.number);
          return Number.isFinite(n) ? n : null;
        }
      }
      return null;
    };

    const bucketSentiment = (type: string, value: number) => {
      if (type === "nps") {
        // 0–10: promoters / passives / detractors
        if (value >= 7) happyCount++;
        else if (value >= 4) neutralCount++;
        else concernedCount++;
        return;
      }
      if (type === "likert_7") {
        // 1–7
        if (value >= 5) happyCount++;
        else if (value === 4) neutralCount++;
        else concernedCount++;
        return;
      }
      // sentiment | likert_5 | rating_5 — 1–5
      if (value >= 4) happyCount++;
      else if (value === 3) neutralCount++;
      else concernedCount++;
    };

    // Count every pulse-scale answer (sentiment, NPS, Likert, rating).
    // Stopping after sentiment-only misses NPS/Likert rows that share the same
    // response table (e.g. seed data: ~10 sentiment + ~10 NPS of 30 total).
    surveyResponsesData.data?.forEach((response) => {
      if (!response.question_id) return;
      const type = questionTypeById.get(response.question_id);
      if (!type) return;
      const value = extractAnswerNumber(response.answer);
      if (value === null) return;
      bucketSentiment(type, value);
    });

    const totalSentimentResponses = happyCount + neutralCount + concernedCount;
    const happinessScore =
      totalSentimentResponses > 0
        ? (happyCount / totalSentimentResponses) * 100
        : 0;

    // Calculate page visits (unique visitors)
    const uniquePageVisits = new Set<string>();
    analyticsData.data?.forEach((event) => {
      if (event.event_type === EventType.PAGE_VISIT) {
        const identifier = event.email || event.session_id;
        if (identifier) uniquePageVisits.add(identifier);
      }
    });

    const pageVisits = uniquePageVisits.size;

    // Calculate survey responses count
    const surveyResponses = new Set<string>();
    analyticsData.data?.forEach((event) => {
      if (event.event_type === EventType.SURVEY_COMPLETION) {
        const identifier = event.email || event.session_id;
        if (identifier) surveyResponses.add(identifier);
      }
    });

    // Calculate engagement (copy + download + wallet)
    const copyCodeClicks =
      analyticsData.data?.filter((e) => e.event_type === EventType.CODE_COPY)
        .length || 0;
    const downloads =
      analyticsData.data?.filter(
        (e) => e.event_type === EventType.COUPON_DOWNLOAD
      ).length || 0;
    const walletAdds =
      analyticsData.data?.filter((e) => e.event_type === EventType.WALLET_ADD)
        .length || 0;
    const engagement = copyCodeClicks + downloads + walletAdds;

    // Calculate conversion rate (survey responses / page visits)
    const conversionRate =
      pageVisits > 0 ? (surveyResponses.size / pageVisits) * 100 : 0;

    // Find top coupon
    const couponCounts: Record<string, number> = {};
    issuedCouponsData.data?.forEach((ic) => {
      if (ic.coupon_id) {
        couponCounts[ic.coupon_id] = (couponCounts[ic.coupon_id] || 0) + 1;
      }
    });

    let topCoupon: { name: string; count: number } | null = null;
    if (Object.keys(couponCounts).length > 0) {
      const topCouponId = Object.entries(couponCounts).sort(
        ([, a], [, b]) => b - a
      )[0][0];

      const { data: coupon } = await tenantSupabase
        .from("coupons")
        .select("title")
        .eq("id", topCouponId)
        .maybeSingle();

      if (coupon) {
        topCoupon = {
          name: coupon.title || "Unknown",
          count: couponCounts[topCouponId],
        };
      }
    }

    return {
      totalResponses,
      uniqueSessions,
      happinessScore: Math.round(happinessScore * 10) / 10, // Round to 1 decimal
      happyResponses: happyCount,
      pageVisits,
      conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
      engagement,
      topCoupon,
      sentimentDistribution: {
        happy: happyCount,
        neutral: neutralCount,
        concerned: concernedCount,
      },
      engagementFunnel: {
        pageVisits,
        surveyResponses: surveyResponses.size,
        copyCodeClicks,
        downloadWallet: downloads + walletAdds,
      },
      error: null,
    };
  } catch (err) {
    console.error("Failed to get dashboard metrics:", err);
    return {
      totalResponses: 0,
      uniqueSessions: 0,
      happinessScore: 0,
      happyResponses: 0,
      pageVisits: 0,
      conversionRate: 0,
      engagement: 0,
      topCoupon: null,
      sentimentDistribution: {
        happy: 0,
        neutral: 0,
        concerned: 0,
      },
      engagementFunnel: {
        pageVisits: 0,
        surveyResponses: 0,
        copyCodeClicks: 0,
        downloadWallet: 0,
      },
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
