/**
 * Row mappers for the survey collector model (surveys, survey_items, survey_questions).
 */

import type {
  HydratedSurveyQuestion,
  Survey as SurveyRecord,
  SurveyItem,
} from "@/lib/types/survey-collector";

export function mapSurvey(row: Record<string, unknown>): SurveyRecord {
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

export function mapSurveyItem(row: Record<string, unknown>): SurveyItem {
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

export function mapQuestion(row: Record<string, unknown>): HydratedSurveyQuestion {
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
