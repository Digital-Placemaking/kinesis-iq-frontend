/**
 * lib/types/question.ts
 * Question type definitions.
 * Defines all TypeScript interfaces and types related to survey questions and question results.
 * Questions are part of surveys that visitors complete to provide feedback.
 */

import type { QuestionType } from "./survey";

/**
 * Survey question record from the database
 * Matches the survey_questions table schema in PostgreSQL
 *
 * @property id - Unique identifier (UUID)
 * @property tenant_id - Foreign key to tenants table (UUID)
 * @property question - The question text displayed to visitors
 * @property type - Type of question (matches QuestionType enum)
 * @property options - JSONB array of options for choice-based questions
 * @property order_index - Display order of the question (0-based)
 * @property is_active - Whether the question is currently active (default: true)
 */
export interface Question {
  id: string;
  tenant_id: string;
  question: string;
  type: QuestionType;
  options: string[] | any[]; // JSONB array - can be string array or structured data
  order_index: number;
  is_active: boolean;
}

/**
 * Input data for creating a new question
 */
export interface CreateQuestionInput {
  question: string;
  type: QuestionType;
  options?: string[] | any[];
  order_index?: number;
  is_active?: boolean;
}

/**
 * Input data for updating an existing question
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateQuestionInput {
  question?: string;
  type?: QuestionType;
  options?: string[] | any[];
  order_index?: number;
  is_active?: boolean;
}

/**
 * Response type for question operations
 */
export interface QuestionResponse {
  question: Question | null;
  error: string | null;
}

/**
 * Response type for fetching multiple questions
 */
export interface QuestionsResponse {
  questions: Question[] | null;
  error: string | null;
}

/**
 * Response type for question create/update operations
 */
export interface QuestionMutationResponse {
  success: boolean;
  error: string | null;
  question?: Question | null;
}

/**
 * Question result statistics for numeric questions
 * Used when displaying question results in the admin dashboard
 *
 * @property min - Minimum value in responses
 * @property max - Maximum value in responses
 * @property mean - Average (mean) value of responses
 * @property median - Median value of responses
 * @property distribution - Object mapping values to counts (e.g., { 1: 5, 2: 10, 3: 8 })
 */
export interface NumericStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  distribution: Record<number, number>;
}

/**
 * Question result statistics for boolean (yes/no) questions
 *
 * @property yes - Count of "yes" responses
 * @property no - Count of "no" responses
 */
export interface BooleanCounts {
  yes: number;
  no: number;
}

/**
 * Question result statistics for date-based questions
 * Maps date strings to response counts
 */
export type DateCounts = Record<string, number>;

/**
 * Question result statistics for time-based questions
 * Maps time strings to response counts
 */
export type TimeCounts = Record<string, number>;

/**
 * Question result data structure
 * Used for displaying question results in the admin dashboard
 *
 * @property totalResponses - Total number of responses for this question
 * @property questionType - Type of the question
 * @property questionText - The question text
 * @property options - Available options (for choice-based questions)
 * @property choiceCounts - Count of each choice option (for multiple/single choice)
 * @property numericStats - Statistics for numeric questions
 * @property booleanCounts - Counts for yes/no questions
 * @property textResponses - Array of text responses (for open text questions, paginated)
 * @property dateCounts - Count by date (for date questions)
 * @property timeCounts - Count by time (for time questions)
 */
export interface QuestionResult {
  totalResponses: number;
  questionType: string;
  questionText: string;
  options?: string[];
  choiceCounts?: Record<string, number>;
  numericStats?: NumericStats;
  booleanCounts?: BooleanCounts;
  textResponses?: string[];
  dateCounts?: DateCounts;
  timeCounts?: TimeCounts;
}
