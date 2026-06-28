/**
 * lib/types/survey-collector.ts
 *
 * Types for the survey collector model (surveys + survey_items + question bank).
 * Matches schema: tenants → survey_questions (bank) → surveys → survey_items → survey_responses
 */

/** surveys.kind */
export type SurveyKind = "survey" | "poll";

/** surveys.status */
export type SurveyStatus = "draft" | "active" | "closed";

/**
 * Row in the `surveys` table (survey collector container).
 */
export interface Survey {
  id: string;
  tenant_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  kind: SurveyKind;
  status: SurveyStatus;
  settings: Record<string, unknown>;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
}

/**
 * Row in the `survey_items` join table (question membership + order within a survey).
 */
export interface SurveyItem {
  id: string;
  tenant_id: string;
  survey_id: string;
  question_id: string;
  order_index: number;
  required: boolean;
  settings: Record<string, unknown>;
  created_at: string;
}

/**
 * Question bank row shape embedded on a survey item (survey_questions).
 * Uses `string` for type to avoid circular imports; matches QuestionType at runtime.
 */
export interface HydratedSurveyQuestion {
  id: string;
  tenant_id: string;
  question: string;
  type: string;
  options: unknown[];
  /** Legacy bank order — display order within a survey comes from SurveyItem.order_index */
  order_index: number;
  is_active?: boolean;
}

/**
 * survey_items row with the linked survey_questions row attached (admin + visitor load).
 */
export interface HydratedSurveyItem extends SurveyItem {
  question: HydratedSurveyQuestion;
}

/** Input for creating a surveys row */
export interface CreateSurveyInput {
  title: string;
  slug?: string | null;
  description?: string | null;
  kind?: SurveyKind;
  status?: SurveyStatus;
  settings?: Record<string, unknown>;
  starts_at?: string | null;
  ends_at?: string | null;
}

/** Input for updating a surveys row */
export interface UpdateSurveyInput {
  title?: string;
  slug?: string | null;
  description?: string | null;
  kind?: SurveyKind;
  status?: SurveyStatus;
  settings?: Record<string, unknown>;
  starts_at?: string | null;
  ends_at?: string | null;
}

/** Input for linking a bank question to a survey */
export interface CreateSurveyItemInput {
  survey_id: string;
  question_id: string;
  order_index: number;
  required?: boolean;
  settings?: Record<string, unknown>;
}

/** Input for updating a survey_items row */
export interface UpdateSurveyItemInput {
  order_index?: number;
  required?: boolean;
  settings?: Record<string, unknown>;
}

/** surveys list / single-survey action responses */
export interface SurveysListResponse {
  surveys: Survey[] | null;
  error: string | null;
}

export interface SurveyWithItemsResponse {
  survey: Survey | null;
  items: HydratedSurveyItem[] | null;
  error: string | null;
}

export interface SurveyMutationResponse {
  success: boolean;
  error: string | null;
  survey?: Survey | null;
}

export interface SurveyItemMutationResponse {
  success: boolean;
  error: string | null;
  item?: SurveyItem | null;
}
