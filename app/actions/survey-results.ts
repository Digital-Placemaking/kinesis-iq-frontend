/**
 * app/actions/survey-results.ts
 *
 * Staff-facing survey reporting: aggregate counts by survey_id and
 * per-question result breakdowns (optional survey scope).
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type {
  SurveySummary,
  SurveySummaryResponse,
} from "@/lib/types/survey-collector";

/**
 * Aggregate response and session counts for a survey, plus per-question totals.
 */
export async function getSurveySummary(
  tenantSlug: string,
  surveyId: string
): Promise<SurveySummaryResponse> {
  try {
    const supabase = await createClient();

    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );

    if (resolveError || !tenantId) {
      return {
        summary: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    const { data: survey, error: surveyError } = await tenantSupabase
      .from("surveys")
      .select("id")
      .eq("id", surveyId)
      .maybeSingle();

    if (surveyError) {
      return { summary: null, error: surveyError.message };
    }

    if (!survey) {
      return { summary: null, error: "Survey not found" };
    }

    const { data: itemRows, error: itemsError } = await tenantSupabase
      .from("survey_items")
      .select("question_id, order_index")
      .eq("survey_id", surveyId)
      .order("order_index", { ascending: true });

    if (itemsError) {
      return { summary: null, error: itemsError.message };
    }

    const items = itemRows ?? [];
    const questionIds = items.map((item) => item.question_id as string);

    const questionTextById = new Map<string, string>();

    if (questionIds.length > 0) {
      const { data: questionRows, error: questionsError } = await tenantSupabase
        .from("survey_questions")
        .select("id, question")
        .in("id", questionIds);

      if (questionsError) {
        return { summary: null, error: questionsError.message };
      }

      for (const row of questionRows ?? []) {
        questionTextById.set(row.id as string, row.question as string);
      }
    }

    const { data: responseRows, error: responsesError } = await tenantSupabase
      .from("survey_responses")
      .select("question_id, session_id")
      .eq("survey_id", surveyId);

    if (responsesError) {
      return { summary: null, error: responsesError.message };
    }

    const responses = responseRows ?? [];
    const countByQuestion = new Map<string, number>();

    for (const row of responses) {
      const qid = row.question_id as string;
      countByQuestion.set(qid, (countByQuestion.get(qid) ?? 0) + 1);
    }

    const sessionIds = new Set<string>();
    for (const row of responses) {
      const sessionId = row.session_id as string | null;
      if (sessionId) {
        sessionIds.add(sessionId);
      }
    }

    const questionTotals = items.map((item) => {
      const questionId = item.question_id as string;

      return {
        question_id: questionId,
        question_text: questionTextById.get(questionId) ?? "Unknown question",
        order_index: item.order_index as number,
        response_count: countByQuestion.get(questionId) ?? 0,
      };
    });

    // Include responses for questions not in survey_items (legacy/orphan rows)
    const itemQuestionIds = new Set(questionIds);

    for (const [questionId, responseCount] of countByQuestion) {
      if (!itemQuestionIds.has(questionId)) {
        questionTotals.push({
          question_id: questionId,
          question_text: "Unknown question",
          order_index: questionTotals.length,
          response_count: responseCount,
        });
      }
    }

    const summary: SurveySummary = {
      survey_id: surveyId,
      total_responses: responses.length,
      unique_sessions: sessionIds.size,
      question_totals: questionTotals,
    };

    return { summary, error: null };
  } catch (err) {
    return {
      summary: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
