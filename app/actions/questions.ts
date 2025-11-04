"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";

/**
 * Question Management Actions
 * Server actions for survey question CRUD operations and management
 */

/**
 * Reorders a survey question by moving it up or down
 * Swaps the order_index with the adjacent question using a 3-step swap
 */
export async function reorderQuestion(
  tenantSlug: string,
  questionId: string,
  direction: "up" | "down"
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

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

    // Fetch the current question
    const { data: currentQuestion, error: fetchError } = await tenantSupabase
      .from("survey_questions")
      .select("id, order_index")
      .eq("id", questionId)
      .single();

    if (fetchError || !currentQuestion) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    const currentIndex = currentQuestion.order_index;
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Validate new index is not negative
    if (newIndex < 0) {
      return {
        success: false,
        error: "Cannot move up - already at top",
      };
    }

    // Fetch the question at the target position
    const { data: targetQuestion, error: targetError } = await tenantSupabase
      .from("survey_questions")
      .select("id, order_index")
      .eq("tenant_id", tenantId)
      .eq("order_index", newIndex)
      .maybeSingle();

    if (targetError) {
      return {
        success: false,
        error: targetError.message || "Failed to find target question",
      };
    }

    if (!targetQuestion) {
      return {
        success: false,
        error: `Cannot move ${direction} - already at ${
          direction === "up" ? "top" : "bottom"
        }`,
      };
    }

    // Swap the order_index values using a 3-step swap to avoid unique constraint violations
    const tempIndex = -(Date.now() % 1000000);

    // Step 1: Move current question to temp index
    const { error: updateCurrentToTempError } = await tenantSupabase
      .from("survey_questions")
      .update({ order_index: tempIndex })
      .eq("id", questionId);

    if (updateCurrentToTempError) {
      return {
        success: false,
        error:
          updateCurrentToTempError.message || "Failed to update question order",
      };
    }

    // Step 2: Move target question to current index
    const { error: updateTargetToCurrentError } = await tenantSupabase
      .from("survey_questions")
      .update({ order_index: currentIndex })
      .eq("id", targetQuestion.id);

    if (updateTargetToCurrentError) {
      // Rollback: restore current question
      await tenantSupabase
        .from("survey_questions")
        .update({ order_index: currentIndex })
        .eq("id", questionId);
      return {
        success: false,
        error:
          updateTargetToCurrentError.message ||
          "Failed to update question order",
      };
    }

    // Step 3: Move current question (now at temp) to new index
    const { error: updateCurrentToNewError } = await tenantSupabase
      .from("survey_questions")
      .update({ order_index: newIndex })
      .eq("id", questionId);

    if (updateCurrentToNewError) {
      // Rollback: restore both
      await tenantSupabase
        .from("survey_questions")
        .update({ order_index: currentIndex })
        .eq("id", questionId);
      await tenantSupabase
        .from("survey_questions")
        .update({ order_index: newIndex })
        .eq("id", targetQuestion.id);
      return {
        success: false,
        error:
          updateCurrentToNewError.message || "Failed to update question order",
      };
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

/**
 * Toggles the active status of a survey question
 */
export async function toggleQuestionStatus(
  tenantSlug: string,
  questionId: string
): Promise<{ success: boolean; error: string | null }> {
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
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch current question status
    const { data: question, error: fetchError } = await tenantSupabase
      .from("survey_questions")
      .select("id, is_active")
      .eq("id", questionId)
      .single();

    if (fetchError || !question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    // Toggle the status (default to true if null)
    const newStatus = !(question.is_active ?? true);

    const { error: updateError } = await tenantSupabase
      .from("survey_questions")
      .update({ is_active: newStatus })
      .eq("id", questionId);

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to update question status",
      };
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

/**
 * Updates a survey question
 * Handles all question types and their specific fields
 */
export async function updateQuestion(
  tenantSlug: string,
  questionId: string,
  updates: {
    question?: string;
    type?: string;
    options?: string[] | any[];
    is_active?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

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

    // Build update object
    const updateData: any = {};
    if (updates.question !== undefined) updateData.question = updates.question;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.options !== undefined) updateData.options = updates.options;
    if (updates.is_active !== undefined)
      updateData.is_active = updates.is_active;

    // Update the question
    const { data, error: updateError } = await tenantSupabase
      .from("survey_questions")
      .update(updateData)
      .eq("id", questionId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to update question",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Update blocked - no rows were updated. Check RLS policies.",
      };
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

/**
 * Creates a new survey question
 * Automatically assigns the next order_index
 */
export async function createQuestion(
  tenantSlug: string,
  questionData: {
    question: string;
    type: string;
    options?: string[] | any[];
    is_active?: boolean;
  }
): Promise<{
  success: boolean;
  questionId: string | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        questionId: null,
        error: "Not authenticated",
      };
    }

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
        questionId: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Get the next order_index (max + 1)
    const { data: existingQuestions } = await tenantSupabase
      .from("survey_questions")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrderIndex =
      existingQuestions && existingQuestions.length > 0
        ? (existingQuestions[0].order_index || 0) + 1
        : 1;

    // Build insert object
    const insertData: any = {
      tenant_id: tenantId,
      question: questionData.question,
      type: questionData.type,
      order_index: nextOrderIndex,
      is_active: questionData.is_active ?? true,
    };

    // Only include options if they're provided and the type requires them
    const requiresOptions = [
      "multiple_choice",
      "single_choice",
      "ranked_choice",
      "sentiment",
    ].includes(questionData.type);

    if (requiresOptions) {
      insertData.options = questionData.options || [];
    } else {
      insertData.options = [];
    }

    // Insert the question
    const { data, error: insertError } = await tenantSupabase
      .from("survey_questions")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        questionId: null,
        error: insertError.message || "Failed to create question",
      };
    }

    if (!data) {
      return {
        success: false,
        questionId: null,
        error: "Insert blocked - no rows were created. Check RLS policies.",
      };
    }

    return {
      success: true,
      questionId: data.id,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      questionId: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Deletes a survey question
 * Also handles reordering remaining questions to fill gaps
 */
export async function deleteQuestion(
  tenantSlug: string,
  questionId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

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

    // Get the question's order_index before deletion
    const { data: questionToDelete, error: fetchQuestionError } =
      await tenantSupabase
        .from("survey_questions")
        .select("order_index")
        .eq("id", questionId)
        .single();

    if (fetchQuestionError || !questionToDelete) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    const deletedOrderIndex = questionToDelete.order_index;

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

    // Reorder remaining questions to fill the gap
    const { data: questionsToReorder, error: fetchReorderError } =
      await tenantSupabase
        .from("survey_questions")
        .select("id, order_index")
        .eq("tenant_id", tenantId)
        .gt("order_index", deletedOrderIndex)
        .order("order_index", { ascending: true });

    if (fetchReorderError) {
      console.warn(
        "Failed to fetch questions for reordering:",
        fetchReorderError
      );
    } else if (questionsToReorder && questionsToReorder.length > 0) {
      // Update each question's order_index
      for (const question of questionsToReorder) {
        const { error: updateError } = await tenantSupabase
          .from("survey_questions")
          .update({ order_index: question.order_index - 1 })
          .eq("id", question.id);

        if (updateError) {
          console.warn(
            `Failed to reorder question ${question.id}:`,
            updateError
          );
        }
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

/**
 * Fetches a single survey question by ID
 */
export async function getQuestionById(
  tenantSlug: string,
  questionId: string
): Promise<{ question: any | null; error: string | null }> {
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
    const { data: question, error: fetchError } = await tenantSupabase
      .from("survey_questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (fetchError || !question) {
      return {
        question: null,
        error: fetchError?.message || "Question not found",
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
