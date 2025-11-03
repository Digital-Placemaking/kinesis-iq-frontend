/**
 * Survey question types
 * Matches the schema: 'sentiment' | 'ranked_choice'
 */
export type QuestionType = "sentiment" | "ranked_choice";

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
 */
export interface QuestionAnswer {
  question_id: string;
  answer_text?: string | null;
  answer_number?: number | null;
  answer_boolean?: boolean | null;
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
