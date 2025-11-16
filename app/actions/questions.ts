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

/**
 * Fetches all responses for a specific question
 */
export async function getQuestionResults(
  tenantSlug: string,
  questionId: string
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

    // Fetch all responses for this question
    const { data: responses, error: responsesError } = await tenantSupabase
      .from("survey_responses")
      .select("answer")
      .eq("question_id", questionId);

    if (responsesError) {
      return {
        results: null,
        error: `Failed to fetch responses: ${responsesError.message}`,
      };
    }

    const totalResponses = responses?.length || 0;

    if (totalResponses === 0) {
      return {
        results: {
          totalResponses: 0,
          questionType: question.type,
          questionText: question.question,
          options: Array.isArray(question.options) ? question.options : [],
        },
        error: null,
      };
    }

    // Process responses based on question type
    const questionType = question.type;
    const options = Array.isArray(question.options) ? question.options : [];

    if (
      questionType === "multiple_choice" ||
      questionType === "single_choice" ||
      questionType === "ranked_choice"
    ) {
      // Count choices
      const choiceCounts: Record<string, number> = {};

      responses?.forEach((response: { answer: SurveyAnswer | null }) => {
        const answer = response.answer;
        if (answer && typeof answer === "object") {
          if ("array" in answer && Array.isArray(answer.array)) {
            // Multiple choice - array of selected options
            answer.array.forEach((option: string) => {
              choiceCounts[option] = (choiceCounts[option] || 0) + 1;
            });
          } else if ("text" in answer && typeof answer.text === "string") {
            // Single choice - text option
            choiceCounts[answer.text] = (choiceCounts[answer.text] || 0) + 1;
          }
        }
      });

      return {
        results: {
          totalResponses,
          questionType,
          questionText: question.question,
          options,
          choiceCounts,
        },
        error: null,
      };
    }

    if (questionType === "yes_no") {
      // Count yes/no
      let yesCount = 0;
      let noCount = 0;

      responses?.forEach((response: { answer: SurveyAnswer | null }) => {
        const answer = response.answer;
        if (answer && typeof answer === "object" && "boolean" in answer) {
          if (answer.boolean === true) yesCount++;
          else if (answer.boolean === false) noCount++;
        }
      });

      return {
        results: {
          totalResponses,
          questionType,
          questionText: question.question,
          booleanCounts: { yes: yesCount, no: noCount },
        },
        error: null,
      };
    }

    if (
      questionType === "nps" ||
      questionType === "likert_5" ||
      questionType === "likert_7" ||
      questionType === "rating_5" ||
      questionType === "numeric" ||
      questionType === "slider" ||
      questionType === "sentiment"
    ) {
      // Numeric statistics
      const numbers: number[] = [];
      const distribution: Record<number, number> = {};

      responses?.forEach((response: { answer: SurveyAnswer | null }) => {
        const answer = response.answer;
        if (
          answer &&
          typeof answer === "object" &&
          "number" in answer &&
          answer.number !== undefined &&
          answer.number !== null
        ) {
          const num = Number(answer.number);
          numbers.push(num);
          distribution[num] = (distribution[num] || 0) + 1;
        }
      });

      if (numbers.length === 0) {
        return {
          results: {
            totalResponses,
            questionType,
            questionText: question.question,
            numericStats: {
              min: 0,
              max: 0,
              mean: 0,
              median: 0,
              distribution: {},
            },
          },
          error: null,
        };
      }

      numbers.sort((a, b) => a - b);
      const min = numbers[0];
      const max = numbers[numbers.length - 1];
      const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
      const median =
        numbers.length % 2 === 0
          ? (numbers[numbers.length / 2 - 1] + numbers[numbers.length / 2]) / 2
          : numbers[Math.floor(numbers.length / 2)];

      return {
        results: {
          totalResponses,
          questionType,
          questionText: question.question,
          numericStats: {
            min,
            max,
            mean: Number(mean.toFixed(2)),
            median: Number(median.toFixed(2)),
            distribution,
          },
        },
        error: null,
      };
    }

    if (questionType === "open_text") {
      // Text responses
      const textResponses: string[] = [];

      responses?.forEach((response: { answer: SurveyAnswer | null }) => {
        const answer = response.answer;
        if (
          answer &&
          typeof answer === "object" &&
          "text" in answer &&
          answer.text &&
          typeof answer.text === "string" &&
          answer.text.trim()
        ) {
          textResponses.push(answer.text);
        }
      });

      return {
        results: {
          totalResponses,
          questionType,
          questionText: question.question,
          textResponses,
        },
        error: null,
      };
    }

    if (questionType === "date") {
      // Date counts
      const dateCounts: Record<string, number> = {};

      responses?.forEach((response: { answer: SurveyAnswer | null }) => {
        const answer = response.answer;
        if (
          answer &&
          typeof answer === "object" &&
          "text" in answer &&
          answer.text &&
          typeof answer.text === "string"
        ) {
          const date = answer.text.split("T")[0]; // Get date part only
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        }
      });

      return {
        results: {
          totalResponses,
          questionType,
          questionText: question.question,
          dateCounts,
        },
        error: null,
      };
    }

    if (questionType === "time") {
      // Time counts
      const timeCounts: Record<string, number> = {};

      responses?.forEach((response: { answer: SurveyAnswer | null }) => {
        const answer = response.answer;
        if (
          answer &&
          typeof answer === "object" &&
          "text" in answer &&
          answer.text &&
          typeof answer.text === "string"
        ) {
          timeCounts[answer.text] = (timeCounts[answer.text] || 0) + 1;
        }
      });

      return {
        results: {
          totalResponses,
          questionType,
          questionText: question.question,
          timeCounts,
        },
        error: null,
      };
    }

    // Unknown question type
    return {
      results: {
        totalResponses,
        questionType,
        questionText: question.question,
      },
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

    const { error: insertError } = await tenantSupabase
      .from("survey_questions")
      .insert(insertData);

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Failed to create question",
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
