"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { EventType } from "@/lib/types/analytics";

/**
 * Analytics Actions
 * Server actions for fetching analytics data for admin dashboard
 */

/**
 * Get aggregated analytics summary for visitors page
 * Returns counts for each event type
 */
export async function getAnalyticsSummary(tenantSlug: string): Promise<{
  pageVisits: number;
  congratulations: number;
  copyCode: number;
  downloads: number;
  walletAdds: number;
  uniqueActionTakers: number;
  error: string | null;
}> {
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
        pageVisits: 0,
        congratulations: 0,
        copyCode: 0,
        downloads: 0,
        walletAdds: 0,
        uniqueActionTakers: 0,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch all events to calculate unique counts
    // We need to fetch data to count distinct sessions/emails
    const [
      pageVisitData,
      surveyCompletionData,
      codeCopyData,
      downloadData,
      walletData,
    ] = await Promise.all([
      // Page visits: Fetch all to count distinct sessions/emails
      tenantSupabase
        .from("analytics_events")
        .select("session_id, email")
        .eq("event_type", EventType.PAGE_VISIT),

      // Survey completions: Fetch all to count distinct visitors
      tenantSupabase
        .from("analytics_events")
        .select("session_id, email")
        .eq("event_type", EventType.SURVEY_COMPLETION),

      // Code copies: Fetch all to count distinct sessions/emails
      tenantSupabase
        .from("analytics_events")
        .select("session_id, email")
        .eq("event_type", EventType.CODE_COPY),

      // Coupon downloads: Fetch all to count distinct sessions/emails
      tenantSupabase
        .from("analytics_events")
        .select("session_id, email")
        .eq("event_type", EventType.COUPON_DOWNLOAD),

      // Wallet adds: Fetch all to count distinct sessions/emails
      tenantSupabase
        .from("analytics_events")
        .select("session_id, email")
        .eq("event_type", EventType.WALLET_ADD),
    ]);

    // Count unique page visits (distinct visitors - prefer email, fallback to session_id)
    const uniquePageVisits = new Set<string>();
    pageVisitData.data?.forEach((event) => {
      // Use email if available, otherwise use session_id
      const identifier = event.email || event.session_id;
      if (identifier) uniquePageVisits.add(identifier);
    });

    // Count unique survey completions (distinct visitors - prefer email, fallback to session_id)
    const uniqueSurveyCompletions = new Set<string>();
    surveyCompletionData.data?.forEach((event) => {
      // Use email if available, otherwise use session_id
      const identifier = event.email || event.session_id;
      if (identifier) uniqueSurveyCompletions.add(identifier);
    });

    // Count unique visitors who took at least one action (copy, download, or wallet)
    // Use email if available, otherwise use session_id to match page visit counting
    const uniqueActionTakers = new Set<string>();
    [codeCopyData, downloadData, walletData].forEach((actionData) => {
      actionData.data?.forEach((event) => {
        // Use email if available, otherwise use session_id
        const identifier = event.email || event.session_id;
        if (identifier) uniqueActionTakers.add(identifier);
      });
    });

    return {
      pageVisits: uniquePageVisits.size,
      congratulations: uniqueSurveyCompletions.size,
      copyCode: codeCopyData.data?.length || 0,
      downloads: downloadData.data?.length || 0,
      walletAdds: walletData.data?.length || 0,
      uniqueActionTakers: uniqueActionTakers.size,
      error: null,
    };
  } catch (err) {
    console.error("Failed to get analytics summary:", err);
    return {
      pageVisits: 0,
      congratulations: 0,
      copyCode: 0,
      downloads: 0,
      walletAdds: 0,
      uniqueActionTakers: 0,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Get time-series analytics data for charts
 * Returns daily aggregated data for the last 30 days
 */
export async function getAnalyticsTimeSeries(
  tenantSlug: string,
  days: number = 30
): Promise<{
  data: Array<{
    date: string;
    pageVisits: number;
    surveyCompletions: number;
    codeCopies: number;
    couponDownloads: number;
    walletAdds: number;
  }>;
  error: string | null;
}> {
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
        data: [],
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all events in the date range
    const { data: events, error: eventsError } = await tenantSupabase
      .from("analytics_events")
      .select("event_type, created_at")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    if (eventsError) {
      return {
        data: [],
        error: eventsError.message,
      };
    }

    // Initialize date map for all days in range
    const dateMap = new Map<
      string,
      {
        date: string;
        pageVisits: number;
        surveyCompletions: number;
        codeCopies: number;
        couponDownloads: number;
        walletAdds: number;
      }
    >();

    // Initialize all dates with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      dateMap.set(dateStr, {
        date: dateStr,
        pageVisits: 0,
        surveyCompletions: 0,
        codeCopies: 0,
        couponDownloads: 0,
        walletAdds: 0,
      });
    }

    // Aggregate events by date
    events?.forEach((event) => {
      const eventDate = new Date(event.created_at);
      const dateStr = eventDate.toISOString().split("T")[0];
      const dayData = dateMap.get(dateStr);

      if (dayData) {
        switch (event.event_type) {
          case EventType.PAGE_VISIT:
            dayData.pageVisits++;
            break;
          case EventType.SURVEY_COMPLETION:
            dayData.surveyCompletions++;
            break;
          case EventType.CODE_COPY:
            dayData.codeCopies++;
            break;
          case EventType.COUPON_DOWNLOAD:
            dayData.couponDownloads++;
            break;
          case EventType.WALLET_ADD:
            dayData.walletAdds++;
            break;
        }
      }
    });

    // Convert map to array and sort by date
    const data = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return {
      data,
      error: null,
    };
  } catch (err) {
    console.error("Failed to get analytics time series:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
