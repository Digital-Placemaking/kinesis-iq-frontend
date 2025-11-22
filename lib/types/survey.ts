/**
 * lib/types/survey.ts
 * Survey type definitions.
 * Defines TypeScript types for surveys, survey questions, and survey submissions.
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
 * Individual survey question
 * Matches the survey_questions table schema
 */
export interface SurveyQuestion {
  id: string;
  tenant_id: string;
  question: string;
  type: QuestionType;
  options: string[] | any[]; // JSONB array
  order_index: number;
}

/**
 * Survey structure
 * Since there's no surveys table, we use survey_questions directly
 */
export interface Survey {
  tenant_id: string;
  coupon_id?: string | null;
  title?: string; // Optional since we don't have a surveys table
  description?: string | null;
  questions: SurveyQuestion[];
}

/**
 * Answer for a single question
 * For multiple_choice, answer_text should be a JSON string array
 */
export interface QuestionAnswer {
  question_id: string;
  answer_text?: string | null; // For text, date, time, single_choice, ranked_choice, or JSON array for multiple_choice
  answer_number?: number | null; // For numeric, slider, nps, likert, rating, sentiment
  answer_boolean?: boolean | null; // For yes_no
}

/**
 * Complete survey submission
 * Since there's no surveys table, survey_id is actually tenant_id
 */
export interface SurveySubmission {
  survey_id: string; // Actually tenant_id
  coupon_id?: string | null;
  email?: string | null;
  answers: QuestionAnswer[];
}

/**
 * Survey response types
 */
export interface SurveyResponse {
  survey: Survey | null;
  error: string | null;
}

export interface SurveySubmissionResponse {
  success: boolean;
  error: string | null;
}
