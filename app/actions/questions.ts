/**
 * app/actions/questions.ts
 * Server actions for survey question management.
 * Handles question CRUD operations, reordering, and result fetching.
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type { QuestionType } from "@/lib/types/survey";
import type {
  Question,
  QuestionResult,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionResponse,
  QuestionsResponse,
  QuestionMutationResponse,
} from "@/lib/types/question";
import type { SurveyAnswer } from "@/lib/types/survey-answer";
import { aggregateQuestionResults } from "@/lib/survey/aggregate-question-results";

/**
 * Fetches all responses for a specific question, optionally scoped to a survey.
 */
export async function getQuestionResults(
  tenantSlug: string,
  questionId: string,
  surveyId?: string
): Promise<{ results: QuestionResult | null; error: string | null }> {
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
        results: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch the question to get its type and options
    const { data: question, error: questionError } = await tenantSupabase
      .from("survey_questions")
      .select("id, question, type, options")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return {
        results: null,
        error: "Question not found",
      };
    }

    // Fetch responses for this question, optionally filtered by survey
    let responsesQuery = tenantSupabase
      .from("survey_responses")
      .select("answer")
      .eq("question_id", questionId);

    if (surveyId) {
      responsesQuery = responsesQuery.eq("survey_id", surveyId);
    }

    const { data: responses, error: responsesError } = await responsesQuery;

    if (responsesError) {
      return {
        results: null,
        error: `Failed to fetch responses: ${responsesError.message}`,
      };
    }

    return {
      results: aggregateQuestionResults(
        {
          question: question.question,
          type: question.type,
          options: question.options,
        },
        (responses ?? []) as { answer: SurveyAnswer | null }[]
      ),
      error: null,
    };
  } catch (err) {
    return {
      results: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Fetches a single question by ID
 */
export async function getQuestionById(
  tenantSlug: string,
  questionId: string
): Promise<QuestionResponse> {
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
        question: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch the question
    const { data: question, error: questionError } = await tenantSupabase
      .from("survey_questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return {
        question: null,
        error: questionError?.message || "Question not found",
      };
    }

    return {
      question,
      error: null,
    };
  } catch (err) {
    return {
      question: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Creates a new survey question
 */
export async function createQuestion(
  tenantSlug: string,
  question: {
    question: string;
    type: QuestionType;
    options?: string[];
    is_active?: boolean;
  }
): Promise<{ success: boolean; error: string | null; questionId?: string | null }> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Resolve tenant
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );
    if (resolveError || !tenantId) {
      return { success: false, error: `Tenant not found: ${tenantSlug}` };
    }

    // SECURITY: Verify user has staff access to this tenant
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("tenant_id, role")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (staffError || !staff) {
      return {
        success: false,
        error: "You don't have access to this tenant",
      };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    // Input validation: trim question text and validate required fields
    const trimmedQuestion = question.question?.trim();
    if (!trimmedQuestion || trimmedQuestion.length === 0) {
      return { success: false, error: "Question text is required" };
    }
    if (trimmedQuestion.length > 1000) {
      return {
        success: false,
        error: "Question text must be less than 1000 characters",
      };
    }

    // Input validation: validate options array if provided
    let validatedOptions: string[] | null = null;
    if (question.options && Array.isArray(question.options)) {
      validatedOptions = question.options
        .map((opt) => opt?.trim())
        .filter((opt) => opt && opt.length > 0)
        .slice(0, 20); // Limit to 20 options max
    }

    // Get max order_index to append to end
    const { data: questions, error: orderError } = await tenantSupabase
      .from("survey_questions")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1);

    const maxOrder =
      questions && questions.length > 0 ? questions[0].order_index : 0;
    const newOrderIndex = maxOrder + 1;

    const insertData: {
      tenant_id: string;
      question: string;
      type: QuestionType;
      options: string[] | null;
      order_index: number;
      is_active: boolean;
    } = {
      tenant_id: tenantId,
      question: trimmedQuestion,
      type: question.type,
      options: validatedOptions,
      order_index: newOrderIndex,
      is_active: question.is_active ?? true,
    };

    const { data: inserted, error: insertError } = await tenantSupabase
      .from("survey_questions")
      .insert(insertData)
      .select("id")
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Failed to create question",
        questionId: null,
      };
    }

    return {
      success: true,
      error: null,
      questionId: inserted?.id ?? null,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
      questionId: null,
    };
  }
}

/**
 * Updates an existing survey question
 */
export async function updateQuestion(
  tenantSlug: string,
  questionId: string,
  updates: {
    question?: string;
    type?: QuestionType;
    options?: string[];
    is_active?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Resolve tenant
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );
    if (resolveError || !tenantId) {
      return { success: false, error: `Tenant not found: ${tenantSlug}` };
    }

    // SECURITY: Verify user has staff access to this tenant
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("tenant_id, role")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (staffError || !staff) {
      return {
        success: false,
        error: "You don't have access to this tenant",
      };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    // Prepare update data
    const updateData: {
      question?: string;
      type?: QuestionType;
      options?: string[] | null;
      order_index?: number;
      is_active?: boolean;
    } = {};
    if (updates.question !== undefined) updateData.question = updates.question;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.options !== undefined) {
      updateData.options =
        updates.options && updates.options.length > 0 ? updates.options : null;
    }
    if (updates.is_active !== undefined)
      updateData.is_active = updates.is_active;

    const { data, error: updateError } = await tenantSupabase
      .from("survey_questions")
      .update(updateData)
      .eq("id", questionId)
      .select();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to update question",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "Update blocked - no rows were updated. Check RLS policies.",
      };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Deletes a survey question and reorders remaining questions
 */
export async function deleteQuestion(
  tenantSlug: string,
  questionId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Resolve tenant
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );
    if (resolveError || !tenantId) {
      return { success: false, error: `Tenant not found: ${tenantSlug}` };
    }

    // SECURITY: Verify user has staff access to this tenant
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("tenant_id, role")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (staffError || !staff) {
      return {
        success: false,
        error: "You don't have access to this tenant",
      };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    // Get the question to find its order_index
    const { data: question, error: questionError } = await tenantSupabase
      .from("survey_questions")
      .select("order_index")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    const deletedOrderIndex = question.order_index;

    // Delete the question
    const { error: deleteError } = await tenantSupabase
      .from("survey_questions")
      .delete()
      .eq("id", questionId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Failed to delete question",
      };
    }

    // Reorder remaining questions (decrement order_index for questions after deleted one)
    // Fetch all questions with order_index > deletedOrderIndex
    const { data: questionsToReorder, error: fetchError } = await tenantSupabase
      .from("survey_questions")
      .select("id, order_index")
      .gt("order_index", deletedOrderIndex);

    if (fetchError) {
      console.error("Failed to fetch questions for reordering:", fetchError);
      // Don't fail the delete if reorder fails, just log it
    } else if (questionsToReorder && questionsToReorder.length > 0) {
      // Update each question's order_index
      for (const question of questionsToReorder) {
        await tenantSupabase
          .from("survey_questions")
          .update({ order_index: question.order_index - 1 })
          .eq("id", question.id);
      }
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Toggles the active status of a question
 */
export async function toggleQuestionStatus(
  tenantSlug: string,
  questionId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Resolve tenant
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );
    if (resolveError || !tenantId) {
      return { success: false, error: `Tenant not found: ${tenantSlug}` };
    }

    // SECURITY: Verify user has staff access to this tenant
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("tenant_id, role")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (staffError || !staff) {
      return {
        success: false,
        error: "You don't have access to this tenant",
      };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    // Get current status
    const { data: question, error: questionError } = await tenantSupabase
      .from("survey_questions")
      .select("is_active")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    // Toggle status
    const newStatus = !(question.is_active ?? true);

    const { data, error: updateError } = await tenantSupabase
      .from("survey_questions")
      .update({ is_active: newStatus })
      .eq("id", questionId)
      .select();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to toggle question status",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "Update blocked - no rows were updated. Check RLS policies.",
      };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Reorders a question up or down
 */
export async function reorderQuestion(
  tenantSlug: string,
  questionId: string,
  direction: "up" | "down"
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Resolve tenant
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );
    if (resolveError || !tenantId) {
      return { success: false, error: `Tenant not found: ${tenantSlug}` };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    // Get current question
    const { data: currentQuestion, error: currentError } = await tenantSupabase
      .from("survey_questions")
      .select("order_index")
      .eq("id", questionId)
      .single();

    if (currentError || !currentQuestion) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    const currentOrder = currentQuestion.order_index;
    const targetOrder =
      direction === "up" ? currentOrder - 1 : currentOrder + 1;

    // Get the question at the target position
    const { data: targetQuestion, error: targetError } = await tenantSupabase
      .from("survey_questions")
      .select("id, order_index")
      .eq("order_index", targetOrder)
      .single();

    if (targetError || !targetQuestion) {
      return {
        success: false,
        error: `Cannot move ${direction === "up" ? "up" : "down"}: already at ${
          direction === "up" ? "top" : "bottom"
        }`,
      };
    }

    // Swap order indices using a temporary value to avoid unique constraint violations
    // Step 1: Set current question to a temporary negative value
    const tempOrder = -1;
    const { error: step1Error } = await tenantSupabase
      .from("survey_questions")
      .update({ order_index: tempOrder })
      .eq("id", questionId);

    if (step1Error) {
      return {
        success: false,
        error: step1Error.message || "Failed to reorder question",
      };
    }

    // Step 2: Set target question to current order
    const { error: step2Error } = await tenantSupabase
      .from("survey_questions")
      .update({ order_index: currentOrder })
      .eq("id", targetQuestion.id);

    if (step2Error) {
      // Rollback: restore current question
      await tenantSupabase
        .from("survey_questions")
        .update({ order_index: currentOrder })
        .eq("id", questionId);
      return {
        success: false,
        error: step2Error.message || "Failed to reorder question",
      };
    }

    // Step 3: Set current question to target order
    const { data, error: step3Error } = await tenantSupabase
      .from("survey_questions")
      .update({ order_index: targetOrder })
      .eq("id", questionId)
      .select();

    if (step3Error) {
      // Rollback: restore both questions
      await tenantSupabase
        .from("survey_questions")
        .update({ order_index: currentOrder })
        .eq("id", questionId);
      await tenantSupabase
        .from("survey_questions")
        .update({ order_index: targetOrder })
        .eq("id", targetQuestion.id);
      return {
        success: false,
        error: step3Error.message || "Failed to reorder question",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "Update blocked - no rows were updated. Check RLS policies.",
      };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
