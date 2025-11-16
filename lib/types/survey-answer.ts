/**
 * Survey Answer Type Definitions
 *
 * Defines the structure of answer data stored in survey_responses.answer (JSONB field).
 * The structure varies based on the question type.
 */

/**
 * Answer structure for multiple choice questions
 * Stores an array of selected option strings
 */
export interface MultipleChoiceAnswer {
  array: string[];
}

/**
 * Answer structure for single choice questions
 * Stores a single selected option as text
 */
export interface SingleChoiceAnswer {
  text: string;
}

/**
 * Answer structure for ranked choice questions
 * Stores an array of options in ranked order
 */
export interface RankedChoiceAnswer {
  array: string[];
}

/**
 * Answer structure for numeric questions (numeric, slider, nps, likert, rating, sentiment)
 * Stores a numeric value
 */
export interface NumericAnswer {
  number: number;
}

/**
 * Answer structure for yes/no questions
 * Stores a boolean value
 */
export interface BooleanAnswer {
  boolean: boolean;
}

/**
 * Answer structure for open text questions
 * Stores the text response
 */
export interface TextAnswer {
  text: string;
}

/**
 * Answer structure for date questions
 * Stores the date as a string (ISO 8601 format)
 */
export interface DateAnswer {
  date: string;
}

/**
 * Answer structure for time questions
 * Stores the time as a string (HH:mm format)
 */
export interface TimeAnswer {
  time: string;
}

/**
 * Union type for all possible answer structures
 * Used when processing survey responses
 */
export type SurveyAnswer =
  | MultipleChoiceAnswer
  | SingleChoiceAnswer
  | RankedChoiceAnswer
  | NumericAnswer
  | BooleanAnswer
  | TextAnswer
  | DateAnswer
  | TimeAnswer
  | Record<string, any>; // Fallback for unknown structures
