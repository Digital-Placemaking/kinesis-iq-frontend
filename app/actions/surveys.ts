"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { RATE_LIMITS } from "@/lib/constants/rate-limits";
import { checkRateLimit, getClientIdentifier } from "@/lib/utils/rate-limit";
import { trackSurveyCompletion } from "@/lib/analytics/events";
import type {
  SurveyResponse,
  SurveySubmissionResponse,
  SurveySubmission,
  Survey,
  SurveyQuestion,
} from "@/lib/types/survey";
import type { SurveyAnswer } from "@/lib/types/survey-answer";

/**
 * Survey Actions
 * Server actions for survey fetching and submission
 */

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
 * Submits survey answers
 * Creates one row per question in survey_responses table with answer as JSONB
 */
export async function submitSurveyAnswers(
  tenantSlug: string,
  submission: SurveySubmission
): Promise<SurveySubmissionResponse> {
  try {
    // Rate limiting: use email if available, otherwise use IP
    const headersList = await headers();
    const identifier = getClientIdentifier(submission.email, headersList);
    const rateLimit = await checkRateLimit(
      identifier,
      RATE_LIMITS.SURVEY_SUBMIT
    );

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many survey submissions. Please try again in ${Math.ceil(
          (rateLimit.resetAt - Date.now()) / 1000
        )} seconds.`,
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
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

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

    // Track survey completion event
    trackSurveyCompletion(tenantSlug, {
      sessionId,
      email: submission.email || null,
      surveyId: submission.survey_id || undefined,
      couponId: submission.coupon_id || undefined,
    });

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
