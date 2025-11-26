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
      sentimentQuestionsData,
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

      // Sentiment questions: Get all sentiment-type questions
      tenantSupabase
        .from("survey_questions")
        .select("id, type")
        .eq("type", "sentiment"),
    ]);

    // Calculate total responses and unique sessions
    const totalResponses = surveyResponsesData.data?.length || 0;
    const uniqueSessions = new Set(
      surveyResponsesData.data?.map((r) => r.session_id).filter(Boolean) || []
    ).size;

    // Calculate sentiment distribution from sentiment questions
    const sentimentQuestionIds = new Set(
      sentimentQuestionsData.data?.map((q) => q.id) || []
    );

    let happyCount = 0;
    let neutralCount = 0;
    let concernedCount = 0;

    // Process sentiment responses
    surveyResponsesData.data?.forEach((response) => {
      if (
        response.question_id &&
        sentimentQuestionIds.has(response.question_id) &&
        response.answer &&
        typeof response.answer === "object" &&
        "number" in response.answer
      ) {
        const sentimentValue = Number(response.answer.number);
        // Sentiment scale: 1-5 (1-2 = concerned, 3 = neutral, 4-5 = happy)
        if (sentimentValue >= 4) {
          happyCount++;
        } else if (sentimentValue === 3) {
          neutralCount++;
        } else {
          concernedCount++;
        }
      }
    });

    // If no sentiment questions, try to calculate from NPS questions (7+ = happy, 4-6 = neutral, 0-3 = concerned)
    if (happyCount === 0 && neutralCount === 0 && concernedCount === 0) {
      const npsQuestions = await tenantSupabase
        .from("survey_questions")
        .select("id, type")
        .eq("type", "nps");

      const npsQuestionIds = new Set(npsQuestions.data?.map((q) => q.id) || []);

      surveyResponsesData.data?.forEach((response) => {
        if (
          response.question_id &&
          npsQuestionIds.has(response.question_id) &&
          response.answer &&
          typeof response.answer === "object" &&
          "number" in response.answer
        ) {
          const npsValue = Number(response.answer.number);
          if (npsValue >= 7) {
            happyCount++;
          } else if (npsValue >= 4) {
            neutralCount++;
          } else {
            concernedCount++;
          }
        }
      });
    }

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
