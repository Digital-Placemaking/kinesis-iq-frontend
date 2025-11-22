/**
 * lib/types/survey-response.ts
 * Survey response type definitions.
 * Defines all TypeScript interfaces and types related to survey responses submitted by visitors.
 * Survey responses are stored in the survey_responses table.
 */

/**
 * Survey response record from the database
 * Matches the survey_responses table schema in PostgreSQL
 *
 * @property id - Unique identifier (UUID)
 * @property tenant_id - Foreign key to tenants table (UUID)
 * @property question_id - Foreign key to survey_questions table (UUID)
 * @property answer - JSONB field containing the answer data (structure varies by question type)
 * @property session_id - Optional session identifier for grouping responses
 * @property created_at - Timestamp when the response was submitted (ISO 8601 string)
 */
export interface SurveyResponse {
  id: string;
  tenant_id: string;
  question_id: string;
  answer: Record<string, any> | null; // JSONB - structure varies by question type
  session_id: string | null;
  created_at: string;
}

/**
 * Response type for survey response operations
 */
export interface SurveyResponseResponse {
  success: boolean;
  error: string | null;
}
