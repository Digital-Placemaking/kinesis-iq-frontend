/**
 * app/actions/survey-collector.ts
 *
 * Staff-facing server actions for the survey collector model:
 * surveys (containers), survey_items (membership + order), and question bank search.
 *
 * Question bank CRUD remains in questions.ts (createQuestion, updateQuestion, etc.).
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type { QuestionsResponse } from "@/lib/types/question";
import type {
  Survey as SurveyRecord,
  SurveyItem,
  HydratedSurveyItem,
  HydratedSurveyQuestion,
  CreateSurveyInput,
  UpdateSurveyInput,
  CreateSurveyItemInput,
  SurveysListResponse,
  SurveyWithItemsResponse,
  SurveyMutationResponse,
  SurveyItemMutationResponse,
} from "@/lib/types/survey-collector";

type StaffTenantContext = {
  tenantId: string;
  tenantSupabase: Awaited<ReturnType<typeof createTenantClient>>;
  userId: string;
};

type StaffContextResult =
  | { ok: true; ctx: StaffTenantContext }
  | { ok: false; error: string };

async function requireStaffTenantContext(
  tenantSlug: string
): Promise<StaffContextResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { data: tenantId, error: resolveError } = await supabase.rpc(
    "resolve_tenant",
    { slug_input: tenantSlug }
  );

  if (resolveError || !tenantId) {
    return { ok: false, error: `Tenant not found: ${tenantSlug}` };
  }

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (staffError || !staff) {
    return { ok: false, error: "You don't have access to this tenant" };
  }

  const tenantSupabase = await createTenantClient(tenantId);

  return {
    ok: true,
    ctx: { tenantId, tenantSupabase, userId: user.id },
  };
}

function mapSurvey(row: Record<string, unknown>): SurveyRecord {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    title: row.title as string,
    slug: (row.slug as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    kind: row.kind as SurveyRecord["kind"],
    status: row.status as SurveyRecord["status"],
    settings: (row.settings as Record<string, unknown>) ?? {},
    starts_at: (row.starts_at as string | null) ?? null,
    ends_at: (row.ends_at as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function mapSurveyItem(row: Record<string, unknown>): SurveyItem {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    survey_id: row.survey_id as string,
    question_id: row.question_id as string,
    order_index: row.order_index as number,
    required: row.required as boolean,
    settings: (row.settings as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  };
}

function mapQuestion(row: Record<string, unknown>): HydratedSurveyQuestion {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    question: row.question as string,
    type: row.type as string,
    options: Array.isArray(row.options) ? row.options : [],
    order_index: row.order_index as number,
    ...(row.is_active !== undefined && row.is_active !== null
      ? { is_active: row.is_active as boolean }
      : {}),
  };
}

function duplicateKeyError(message: string): boolean {
  return (
    message.includes("duplicate key") ||
    message.includes("unique constraint") ||
    message.includes("23505")
  );
}

/**
 * List all surveys for a tenant, newest first.
 */
export async function listSurveys(
  tenantSlug: string
): Promise<SurveysListResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { surveys: null, error: staffResult.error };
    }

    const { tenantSupabase } = staffResult.ctx;

    const { data, error } = await tenantSupabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { surveys: null, error: error.message };
    }

    return {
      surveys: (data ?? []).map((row) => mapSurvey(row as Record<string, unknown>)),
      error: null,
    };
  } catch (err) {
    return {
      surveys: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Load one survey with ordered survey_items and hydrated survey_questions.
 */
export async function getSurveyWithItems(
  tenantSlug: string,
  surveyId: string
): Promise<SurveyWithItemsResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { survey: null, items: null, error: staffResult.error };
    }

    const { tenantSupabase } = staffResult.ctx;

    const { data: surveyRow, error: surveyError } = await tenantSupabase
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .maybeSingle();

    if (surveyError) {
      return { survey: null, items: null, error: surveyError.message };
    }

    if (!surveyRow) {
      return { survey: null, items: null, error: "Survey not found" };
    }

    const { data: itemRows, error: itemsError } = await tenantSupabase
      .from("survey_items")
      .select("*")
      .eq("survey_id", surveyId)
      .order("order_index", { ascending: true });

    if (itemsError) {
      return { survey: null, items: null, error: itemsError.message };
    }

    const items = itemRows ?? [];

    if (items.length === 0) {
      return {
        survey: mapSurvey(surveyRow as Record<string, unknown>),
        items: [],
        error: null,
      };
    }

    const questionIds = items.map((item) => item.question_id as string);

    const { data: questionRows, error: questionsError } = await tenantSupabase
      .from("survey_questions")
      .select("*")
      .in("id", questionIds);

    if (questionsError) {
      return { survey: null, items: null, error: questionsError.message };
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
        return {
          survey: null,
          items: null,
          error: `Question not found for survey item ${item.id}`,
        };
      }

      hydrated.push({ ...item, question });
    }

    return {
      survey: mapSurvey(surveyRow as Record<string, unknown>),
      items: hydrated,
      error: null,
    };
  } catch (err) {
    return {
      survey: null,
      items: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Create a new survey container.
 */
export async function createSurvey(
  tenantSlug: string,
  input: CreateSurveyInput
): Promise<SurveyMutationResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { success: false, error: staffResult.error, survey: null };
    }

    const { tenantId, tenantSupabase, userId } = staffResult.ctx;

    const title = input.title?.trim();
    if (!title) {
      return { success: false, error: "Survey title is required", survey: null };
    }

    const { data, error } = await tenantSupabase
      .from("surveys")
      .insert({
        tenant_id: tenantId,
        title,
        slug: input.slug?.trim() || null,
        description: input.description?.trim() || null,
        kind: input.kind ?? "survey",
        status: input.status ?? "draft",
        settings: input.settings ?? {},
        starts_at: input.starts_at ?? null,
        ends_at: input.ends_at ?? null,
        created_by: userId,
      })
      .select("*")
      .single();

    if (error) {
      const message = duplicateKeyError(error.message)
        ? "A survey with this slug already exists for this tenant"
        : error.message;
      return { success: false, error: message, survey: null };
    }

    return {
      success: true,
      error: null,
      survey: mapSurvey(data as Record<string, unknown>),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
      survey: null,
    };
  }
}

/**
 * Update an existing survey.
 */
export async function updateSurvey(
  tenantSlug: string,
  surveyId: string,
  input: UpdateSurveyInput
): Promise<SurveyMutationResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { success: false, error: staffResult.error, survey: null };
    }

    const { tenantSupabase } = staffResult.ctx;

    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) {
        return { success: false, error: "Survey title cannot be empty", survey: null };
      }
      updateData.title = title;
    }
    if (input.slug !== undefined) {
      updateData.slug = input.slug?.trim() || null;
    }
    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }
    if (input.kind !== undefined) updateData.kind = input.kind;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.settings !== undefined) updateData.settings = input.settings;
    if (input.starts_at !== undefined) updateData.starts_at = input.starts_at;
    if (input.ends_at !== undefined) updateData.ends_at = input.ends_at;

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "No updates provided", survey: null };
    }

    const { data, error } = await tenantSupabase
      .from("surveys")
      .update(updateData)
      .eq("id", surveyId)
      .select("*")
      .maybeSingle();

    if (error) {
      const message = duplicateKeyError(error.message)
        ? "A survey with this slug already exists for this tenant"
        : error.message;
      return { success: false, error: message, survey: null };
    }

    if (!data) {
      return { success: false, error: "Survey not found", survey: null };
    }

    return {
      success: true,
      error: null,
      survey: mapSurvey(data as Record<string, unknown>),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
      survey: null,
    };
  }
}

/**
 * Delete a survey (survey_items should cascade via FK).
 */
export async function deleteSurvey(
  tenantSlug: string,
  surveyId: string
): Promise<SurveyMutationResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { success: false, error: staffResult.error, survey: null };
    }

    const { tenantSupabase } = staffResult.ctx;

    const { data, error } = await tenantSupabase
      .from("surveys")
      .delete()
      .eq("id", surveyId)
      .select("*")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message, survey: null };
    }

    if (!data) {
      return { success: false, error: "Survey not found", survey: null };
    }

    return {
      success: true,
      error: null,
      survey: mapSurvey(data as Record<string, unknown>),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
      survey: null,
    };
  }
}

/**
 * Link a question bank row to a survey (survey_items insert).
 */
export async function addSurveyItem(
  tenantSlug: string,
  input: CreateSurveyItemInput
): Promise<SurveyItemMutationResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { success: false, error: staffResult.error, item: null };
    }

    const { tenantId, tenantSupabase } = staffResult.ctx;

    const { data: survey, error: surveyError } = await tenantSupabase
      .from("surveys")
      .select("id")
      .eq("id", input.survey_id)
      .maybeSingle();

    if (surveyError) {
      return { success: false, error: surveyError.message, item: null };
    }

    if (!survey) {
      return { success: false, error: "Survey not found", item: null };
    }

    const { data: question, error: questionError } = await tenantSupabase
      .from("survey_questions")
      .select("id")
      .eq("id", input.question_id)
      .maybeSingle();

    if (questionError) {
      return { success: false, error: questionError.message, item: null };
    }

    if (!question) {
      return { success: false, error: "Question not found in bank", item: null };
    }

    const { data, error } = await tenantSupabase
      .from("survey_items")
      .insert({
        tenant_id: tenantId,
        survey_id: input.survey_id,
        question_id: input.question_id,
        order_index: input.order_index,
        required: input.required ?? true,
        settings: input.settings ?? {},
      })
      .select("*")
      .single();

    if (error) {
      const message = duplicateKeyError(error.message)
        ? "This question is already in the survey"
        : error.message;
      return { success: false, error: message, item: null };
    }

    return {
      success: true,
      error: null,
      item: mapSurveyItem(data as Record<string, unknown>),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
      item: null,
    };
  }
}

/**
 * Remove a question from a survey (does not delete the bank question).
 */
export async function removeSurveyItem(
  tenantSlug: string,
  itemId: string
): Promise<SurveyItemMutationResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { success: false, error: staffResult.error, item: null };
    }

    const { tenantSupabase } = staffResult.ctx;

    const { data: removedItem, error: fetchError } = await tenantSupabase
      .from("survey_items")
      .select("*")
      .eq("id", itemId)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message, item: null };
    }

    if (!removedItem) {
      return { success: false, error: "Survey item not found", item: null };
    }

    const { error: deleteError } = await tenantSupabase
      .from("survey_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      return { success: false, error: deleteError.message, item: null };
    }

    const removedOrder = removedItem.order_index as number;
    const surveyId = removedItem.survey_id as string;

    const { data: itemsToShift } = await tenantSupabase
      .from("survey_items")
      .select("id, order_index")
      .eq("survey_id", surveyId)
      .gt("order_index", removedOrder);

    if (itemsToShift) {
      for (const item of itemsToShift) {
        await tenantSupabase
          .from("survey_items")
          .update({ order_index: (item.order_index as number) - 1 })
          .eq("id", item.id as string);
      }
    }

    return {
      success: true,
      error: null,
      item: mapSurveyItem(removedItem as Record<string, unknown>),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
      item: null,
    };
  }
}

/**
 * Swap a survey item up or down within its survey (survey_items.order_index).
 */
export async function reorderSurveyItem(
  tenantSlug: string,
  surveyId: string,
  itemId: string,
  direction: "up" | "down"
): Promise<SurveyItemMutationResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { success: false, error: staffResult.error, item: null };
    }

    const { tenantSupabase } = staffResult.ctx;

    const { data: currentItem, error: currentError } = await tenantSupabase
      .from("survey_items")
      .select("*")
      .eq("id", itemId)
      .eq("survey_id", surveyId)
      .maybeSingle();

    if (currentError) {
      return { success: false, error: currentError.message, item: null };
    }

    if (!currentItem) {
      return { success: false, error: "Survey item not found", item: null };
    }

    const currentOrder = currentItem.order_index as number;
    const targetOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;

    const { data: targetItem, error: targetError } = await tenantSupabase
      .from("survey_items")
      .select("id, order_index")
      .eq("survey_id", surveyId)
      .eq("order_index", targetOrder)
      .maybeSingle();

    if (targetError) {
      return { success: false, error: targetError.message, item: null };
    }

    if (!targetItem) {
      return {
        success: false,
        error: `Cannot move ${direction === "up" ? "up" : "down"}: already at ${
          direction === "up" ? "top" : "bottom"
        }`,
        item: null,
      };
    }

    const tempOrder = -1;

    const { error: step1Error } = await tenantSupabase
      .from("survey_items")
      .update({ order_index: tempOrder })
      .eq("id", itemId);

    if (step1Error) {
      return { success: false, error: step1Error.message, item: null };
    }

    const { error: step2Error } = await tenantSupabase
      .from("survey_items")
      .update({ order_index: currentOrder })
      .eq("id", targetItem.id as string);

    if (step2Error) {
      return { success: false, error: step2Error.message, item: null };
    }

    const { data: updatedItem, error: step3Error } = await tenantSupabase
      .from("survey_items")
      .update({ order_index: targetOrder })
      .eq("id", itemId)
      .select("*")
      .single();

    if (step3Error) {
      return { success: false, error: step3Error.message, item: null };
    }

    return {
      success: true,
      error: null,
      item: mapSurveyItem(updatedItem as Record<string, unknown>),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
      item: null,
    };
  }
}

/**
 * Search the question bank (not scoped to a survey).
 */
export async function searchQuestionBank(
  tenantSlug: string,
  query?: string
): Promise<QuestionsResponse> {
  try {
    const staffResult = await requireStaffTenantContext(tenantSlug);
    if (!staffResult.ok) {
      return { questions: null, error: staffResult.error };
    }

    const { tenantSupabase } = staffResult.ctx;

    let request = tenantSupabase
      .from("survey_questions")
      .select("*")
      .order("order_index", { ascending: true });

    const trimmed = query?.trim();
    if (trimmed) {
      request = request.ilike("question", `%${trimmed}%`);
    }

    const { data, error } = await request.limit(50);

    if (error) {
      return { questions: null, error: error.message };
    }

    return { questions: data ?? [], error: null };
  } catch (err) {
    return {
      questions: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
