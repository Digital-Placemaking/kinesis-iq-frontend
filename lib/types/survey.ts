/**
 * lib/types/survey.ts
 * Survey type definitions.
 * Defines TypeScript types for visitor-facing loaded surveys, questions, and submissions.
 */

import type { SurveyKind, SurveyStatus } from "./survey-collector";

export type QuestionType =
  | "ranked_choice"
  | "sentiment"
  | "single_choice"
  | "multiple_choice"
  | "likert_5"
  | "likert_7"
  | "nps"
  | "rating_5"
  | "yes_no"
  | "open_text"
  | "numeric"
  | "slider"
  | "date"
  | "time";

/**
 * Individual survey question (survey_questions row).
 * When loaded via survey_items, item_id / required / item_settings are populated.
 */
export interface SurveyQuestion {
  id: string;
  tenant_id: string;
  question: string;
  type: QuestionType;
  options: string[] | any[];
  /**
   * Legacy bank order on survey_questions.
   * Prefer survey_items.order_index when rendering a specific survey.
   */
  order_index: number;
  /** survey_items.id — set when hydrated through the collector model */
  item_id?: string;
  /** Per-survey required flag from survey_items */
  required?: boolean;
  /** Per-survey overrides from survey_items.settings */
  item_settings?: Record<string, unknown>;
}

/**
 * Visitor- or staff-facing survey with ordered questions.
 * Loaded via surveys → survey_items → survey_questions (collector model).
 *
 * `id` and `title` are optional until legacy flat-question load paths are migrated.
 */
export interface Survey {
  /** surveys.id — absent on legacy flat survey_questions load */
  id?: string;
  tenant_id: string;
  coupon_id?: string | null;
  title?: string;
  slug?: string | null;
  description?: string | null;
  kind?: SurveyKind;
  status?: SurveyStatus;
  settings?: Record<string, unknown>;
  starts_at?: string | null;
  ends_at?: string | null;
  questions: SurveyQuestion[];
}

/**
 * Answer for a single question in a submission payload.
 * For multiple_choice, answer_text should be a JSON string array.
 */
export interface QuestionAnswer {
  question_id: string;
  answer_text?: string | null; // For text, date, time, single_choice, ranked_choice, or JSON array for multiple_choice
  answer_number?: number | null; // For numeric, slider, nps, likert, rating, sentiment
  answer_boolean?: boolean | null; // For yes_no
}

/**
 * Complete survey submission (one POST per answer row server-side).
 */
export interface SurveySubmission {
  /**
   * surveys.id — survey context for survey_responses.survey_id.
   * Legacy clients may still pass tenant_id here until visitor flow is migrated.
   */
  survey_id: string;
  coupon_id?: string | null;
  email?: string | null;
  answers: QuestionAnswer[];
}

/** Result of loading a survey for display */
export interface SurveyResponse {
  survey: Survey | null;
  error: string | null;
}

export interface SurveySubmissionResponse {
  success: boolean;
  error: string | null;
}
