/**
 * lib/constants/template-questions.ts
 * Global template questions that all tenants receive.
 * These questions are mandatory and appear at the start of every survey.
 */

import type { SurveyQuestion } from "@/lib/types/survey";

/**
 * Template questions that all tenants inherit
 * These appear first in all surveys and cannot be disabled
 */
export const TEMPLATE_QUESTIONS: Omit<
  SurveyQuestion,
  "id" | "tenant_id"
>[] = [
  {
    question: "How are you feeling today?",
    type: "sentiment",
    options: ["1", "2", "3", "4", "5"],
    order_index: -1, // Negative index ensures it always appears first
  },
];

/**
 * Generate a stable ID for template questions
 * Uses a consistent UUID-like format for each template
 */
export function getTemplateQuestionId(index: number): string {
  // Use a fixed UUID namespace for template questions
  const baseUuid = "00000000-0000-0000-0000-";
  return `${baseUuid}${String(index).padStart(12, "0")}`;
}

/**
 * Convert template questions to full SurveyQuestion objects
 * @param tenantId - The tenant ID to associate with template questions
 */
export function getTemplateQuestionsForTenant(
  tenantId: string
): SurveyQuestion[] {
  return TEMPLATE_QUESTIONS.map((template, index) => ({
    ...template,
    id: getTemplateQuestionId(index),
    tenant_id: tenantId,
  }));
}

/**
 * Check if a question ID is a template question
 */
export function isTemplateQuestion(questionId: string): boolean {
  return questionId.startsWith("00000000-0000-0000-0000-");
}
