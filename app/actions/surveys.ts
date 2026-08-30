/**
 * app/actions/surveys.ts
 * Server actions for survey operations.
 * Handles survey fetching, submission, and answer processing.
 */

"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { RATE_LIMITS } from "@/lib/constants/rate-limits";
import {
  checkRateLimit,
  getClientIdentifier,
  markSurveyCompleted,
} from "@/lib/utils/rate-limit";
import { trackSurveyCompletion } from "@/lib/analytics/events";
import type {
  SurveyResponse,
  SurveySubmissionResponse,
  SurveySubmission,
  Survey,
  SurveyQuestion,
  PublicSurveyListItem,
  PublicSurveysListResponse,
  PublicSurveyLoadResponse,
} from "@/lib/types/survey";
import type { SurveyAnswer } from "@/lib/types/survey-answer";
import type { HydratedSurveyItem } from "@/lib/types/survey-collector";
import {
  mapSurvey,
  mapSurveyItem,
  mapQuestion,
} from "@/lib/survey/map-collector";
import {
  allowsAnonymous,
  isSurveyInWindow,
  isUuid,
  mapCollectorToVisitorSurvey,
} from "@/lib/survey/public-survey";

/**
 * Survey Actions
 * Server actions for survey fetching and submission
 */

async function resolveTenantId(
  tenantSlug: string
): Promise<{ tenantId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: tenantId, error: resolveError } = await supabase.rpc(
    "resolve_tenant",
    { slug_input: tenantSlug }
  );

  if (resolveError || !tenantId) {
    return { error: `Tenant not found: ${tenantSlug}` };
  }

  return { tenantId };
}

async function hydrateSurveyItems(
  tenantSupabase: Awaited<ReturnType<typeof createTenantClient>>,
  surveyId: string
): Promise<{ items: HydratedSurveyItem[] } | { error: string }> {
  const { data: itemRows, error: itemsError } = await tenantSupabase
    .from("survey_items")
    .select("*")
    .eq("survey_id", surveyId)
    .order("order_index", { ascending: true });

  if (itemsError) {
    return { error: itemsError.message };
  }

  const items = itemRows ?? [];
  if (items.length === 0) {
    return { items: [] };
  }

  const questionIds = items.map((item) => item.question_id as string);
  const { data: questionRows, error: questionsError } = await tenantSupabase
    .from("survey_questions")
    .select("*")
    .in("id", questionIds);

  if (questionsError) {
    return { error: questionsError.message };
  }

  const questionById = new Map(
    (questionRows ?? []).map((q) => [
      q.id as string,
      mapQuestion(q as Record<string, unknown>),
    ])
  );

  const hydrated: HydratedSurveyItem[] = [];
  for (const itemRow of items) {
    const item = mapSurveyItem(itemRow as Record<string, unknown>);
    const question = questionById.get(item.question_id);
    if (!question) {
      return { error: `Question not found for survey item ${item.id}` };
    }
    hydrated.push({ ...item, question });
  }

  return { items: hydrated };
}

/**
 * Fetches survey questions for a specific tenant
 * Returns all active survey questions for the tenant
 */
export async function getSurveyForTenant(
  tenantSlug: string
): Promise<SurveyResponse> {
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
        survey: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch all active survey questions for this tenant
    // Filter by is_active = true (or null, which defaults to true)
    const { data: questions, error: questionsError } = await tenantSupabase
      .from("survey_questions")
      .select("*")
      .or("is_active.eq.true,is_active.is.null")
      .order("order_index", { ascending: true });

    if (questionsError) {
      return {
        survey: null,
        error: questionsError.message || "Failed to fetch survey questions",
      };
    }

    // Return survey even if no questions - let the page component decide what to do
    if (!questions || questions.length === 0) {
      return {
        survey: {
          tenant_id: tenantId,
          coupon_id: null,
          questions: [],
        },
        error: null,
      };
    }

    // Transform the data to match our Survey interface
    const survey: Survey = {
      tenant_id: tenantId,
      coupon_id: null,
      questions: questions.map((q: SurveyQuestion) => ({
        id: q.id,
        tenant_id: q.tenant_id,
        question: q.question,
        type: q.type,
        options: Array.isArray(q.options) ? q.options : [],
        order_index: q.order_index,
      })),
    };

    return {
      survey,
      error: null,
    };
  } catch (err) {
    return {
      survey: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Fetches survey questions for a specific coupon
 * Returns all active survey questions for the tenant
 */
export async function getSurveyForCoupon(
  tenantSlug: string,
  couponId: string
): Promise<SurveyResponse> {
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
        survey: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch all active survey questions for this tenant
    // Filter by is_active = true (or null, which defaults to true)
    const { data: questions, error: questionsError } = await tenantSupabase
      .from("survey_questions")
      .select("*")
      .or("is_active.eq.true,is_active.is.null")
      .order("order_index", { ascending: true });

    if (questionsError) {
      return {
        survey: null,
        error: questionsError.message || "Failed to fetch survey questions",
      };
    }

    // Return survey even if no questions - let the page component decide what to do
    if (!questions || questions.length === 0) {
      return {
        survey: {
          tenant_id: tenantId,
          coupon_id: couponId,
          questions: [],
        },
        error: null,
      };
    }

    // Transform the data to match our Survey interface
    const survey: Survey = {
      tenant_id: tenantId,
      coupon_id: couponId,
      questions: questions.map((q: SurveyQuestion) => ({
        id: q.id,
        tenant_id: q.tenant_id,
        question: q.question,
        type: q.type,
        options: Array.isArray(q.options) ? q.options : [],
        order_index: q.order_index,
      })),
    };

    return {
      survey,
      error: null,
    };
  } catch (err) {
    return {
      survey: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Lists active, in-window surveys/polls that have at least one question.
 * Used by the public surveys hub.
 */
export async function listPublicSurveys(
  tenantSlug: string
): Promise<PublicSurveysListResponse> {
  try {
    const resolved = await resolveTenantId(tenantSlug);
    if ("error" in resolved) {
      return { surveys: [], error: resolved.error };
    }

    const tenantSupabase = await createTenantClient(resolved.tenantId);
    const { data: surveyRows, error: surveysError } = await tenantSupabase
      .from("surveys")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (surveysError) {
      return { surveys: [], error: surveysError.message };
    }

    const liveSurveys = (surveyRows ?? [])
      .map((row) => mapSurvey(row as Record<string, unknown>))
      .filter((survey) => isSurveyInWindow(survey).ok);

    if (liveSurveys.length === 0) {
      return { surveys: [], error: null };
    }

    const surveyIds = liveSurveys.map((survey) => survey.id);
    const { data: itemRows, error: itemsError } = await tenantSupabase
      .from("survey_items")
      .select("survey_id")
      .in("survey_id", surveyIds);

    if (itemsError) {
      return { surveys: [], error: itemsError.message };
    }

    const countBySurveyId = new Map<string, number>();
    for (const row of itemRows ?? []) {
      const surveyId = row.survey_id as string;
      countBySurveyId.set(surveyId, (countBySurveyId.get(surveyId) ?? 0) + 1);
    }

    const surveys: PublicSurveyListItem[] = liveSurveys
      .map((survey) => ({
        id: survey.id,
        title: survey.title,
        slug: survey.slug,
        description: survey.description,
        kind: survey.kind,
        questionCount: countBySurveyId.get(survey.id) ?? 0,
        allowAnonymous: allowsAnonymous(survey.settings),
      }))
      .filter((survey) => survey.questionCount > 0);

    return { surveys, error: null };
  } catch (err) {
    return {
      surveys: [],
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Loads one public survey by slug or UUID. Drafts are treated as not found.
 */
export async function getPublicSurvey(
  tenantSlug: string,
  surveyRef: string
): Promise<PublicSurveyLoadResponse> {
  try {
    const resolved = await resolveTenantId(tenantSlug);
    if ("error" in resolved) {
      return { survey: null, reason: "not_found", error: resolved.error };
    }

    const tenantSupabase = await createTenantClient(resolved.tenantId);
    const trimmedRef = surveyRef.trim();

    let query = tenantSupabase.from("surveys").select("*");
    query = isUuid(trimmedRef)
      ? query.or(`id.eq.${trimmedRef},slug.eq.${trimmedRef}`)
      : query.eq("slug", trimmedRef);

    const { data: surveyRow, error: surveyError } = await query.maybeSingle();

    if (surveyError) {
      return { survey: null, reason: null, error: surveyError.message };
    }

    if (!surveyRow) {
      return { survey: null, reason: "not_found", error: null };
    }

    const record = mapSurvey(surveyRow as Record<string, unknown>);

    if (record.status === "draft") {
      return { survey: null, reason: "not_found", error: null };
    }

    if (record.status === "closed") {
      return {
        survey: mapCollectorToVisitorSurvey(record, []),
        reason: "inactive",
        error: null,
      };
    }

    const window = isSurveyInWindow(record);
    if (!window.ok) {
      return {
        survey: mapCollectorToVisitorSurvey(record, []),
        reason: window.reason,
        error: null,
      };
    }

    const hydrated = await hydrateSurveyItems(tenantSupabase, record.id);
    if ("error" in hydrated) {
      return { survey: null, reason: null, error: hydrated.error };
    }

    if (hydrated.items.length === 0) {
      return {
        survey: mapCollectorToVisitorSurvey(record, []),
        reason: "no_questions",
        error: null,
      };
    }

    return {
      survey: mapCollectorToVisitorSurvey(record, hydrated.items),
      reason: null,
      error: null,
    };
  } catch (err) {
    return {
      survey: null,
      reason: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Submits survey answers and stores email in email_opt_ins
 *
 * This function is called after a user completes a survey.
 *
 * Flow:
 * 1. User completes survey questions
 * 2. This function is called with survey answers and email
 * 3. Survey responses are saved to survey_responses table
 * 4. Email is stored in email_opt_ins table (if provided)
 * 5. Analytics event is tracked
 * 6. User is redirected to coupon completion page
 *
 * IMPORTANT: This is where first-time users' emails are stored.
 * After this, they become "returning users" and will skip surveys
 * on future coupon claims (see survey page logic).
 *
 * @param tenantSlug - The tenant slug
 * @param submission - Survey submission data including answers and email
 * @returns Success/error response
 */
export async function submitSurveyAnswers(
  tenantSlug: string,
  submission: SurveySubmission
): Promise<SurveySubmissionResponse> {
  try {
    // Note: Rate limiting for surveys is now handled at coupon issuance
    // This prevents spam more effectively (IP-based, coupon-specific)
    // Survey submission itself is not rate limited to allow legitimate retries

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
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    let surveyId: string | null =
      submission.survey_id && isUuid(submission.survey_id)
        ? submission.survey_id
        : null;

    if (surveyId) {
      const { data: surveyRow, error: surveyError } = await tenantSupabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .maybeSingle();

      if (surveyError) {
        return {
          success: false,
          error: `Failed to load survey: ${surveyError.message}`,
        };
      }

      if (!surveyRow) {
        return { success: false, error: "Survey not found" };
      }

      const record = mapSurvey(surveyRow as Record<string, unknown>);
      if (record.status !== "active") {
        return { success: false, error: "This survey is not currently open" };
      }

      const window = isSurveyInWindow(record);
      if (!window.ok) {
        return {
          success: false,
          error:
            window.reason === "not_started"
              ? "This survey has not started yet"
              : "This survey has ended",
        };
      }

      if (!allowsAnonymous(record.settings) && !submission.email) {
        return {
          success: false,
          error: "An email is required to submit this survey",
        };
      }
    } else {
      surveyId = null;
    }

    // Generate a session_id to group all responses together
    const sessionId =
      submission.coupon_id && submission.email
        ? `${submission.coupon_id}-${submission.email}`
        : `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Insert one row per question answer
    const responsesToInsert = submission.answers.map((answer) => {
      // Convert answer to JSONB format
      let answerJsonb: SurveyAnswer | null = null;

      // Handle answer_text (for text, date, time, single_choice, ranked_choice, or JSON array for multiple_choice)
      if (answer.answer_text !== null && answer.answer_text !== undefined) {
        // Check if it's a JSON array (for multiple_choice)
        try {
          const parsed = JSON.parse(answer.answer_text);
          if (Array.isArray(parsed)) {
            answerJsonb = { array: parsed };
          } else {
            answerJsonb = { text: answer.answer_text };
          }
        } catch {
          // Not JSON, treat as plain text
          answerJsonb = { text: answer.answer_text };
        }
      } else if (
        answer.answer_number !== null &&
        answer.answer_number !== undefined
      ) {
        answerJsonb = { number: answer.answer_number };
      } else if (
        answer.answer_boolean !== null &&
        answer.answer_boolean !== undefined
      ) {
        answerJsonb = { boolean: answer.answer_boolean };
      }

      return {
        tenant_id: tenantId,
        survey_id: surveyId,
        question_id: answer.question_id,
        answer: answerJsonb,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };
    });

    const { error: insertError } = await tenantSupabase
      .from("survey_responses")
      .insert(responsesToInsert);

    if (insertError) {
      return {
        success: false,
        error: `Failed to save survey responses: ${insertError.message}`,
      };
    }

    // ============================================================================
    // STORE EMAIL IN email_opt_ins TABLE
    // ============================================================================
    // This is the critical step that converts a first-time user to a returning user.
    // After this, when they click a coupon in the future, the survey page will
    // detect their email is in the table and skip the survey.
    //
    // Note: This only happens for email-based users. OAuth users have their email
    // stored immediately on OAuth callback (see app/auth/oauth-callback/route.ts)
    if (submission.email) {
      const { submitEmail } = await import("./emails");
      // Store email in email_opt_ins table
      // Handles duplicates gracefully (won't error if email already exists)
      await submitEmail(tenantSlug, submission.email).catch((err) => {
        // Log error but don't fail survey submission
        // Email storage failure shouldn't prevent user from getting their coupon
        console.warn("Failed to store email opt-in after survey:", err);
      });
    }

    // Track survey completion event
    trackSurveyCompletion(tenantSlug, {
      sessionId,
      email: submission.email || null,
      surveyId: surveyId || undefined,
      couponId: submission.coupon_id || undefined,
    });

    // Mark survey as completed in Redis to prevent re-access
    // This prevents users from going back to the survey after completion
    if (submission.email) {
      await markSurveyCompleted(
        tenantSlug,
        submission.email,
        submission.coupon_id || null
      ).catch((err) => {
        // Log error but don't fail survey submission
        console.warn("Failed to mark survey as completed in Redis:", err);
      });
      if (surveyId) {
        await markSurveyCompleted(
          tenantSlug,
          submission.email,
          null,
          30,
          surveyId
        ).catch((err) => {
          console.warn("Failed to mark survey as completed in Redis:", err);
        });
      }
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
