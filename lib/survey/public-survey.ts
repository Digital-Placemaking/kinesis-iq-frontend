/**
 * Helpers for the public visitor survey/poll flow.
 * Maps the collector model (surveys + survey_items) to the visitor Survey shape.
 */

import type { QuestionType, Survey, SurveyQuestion } from "@/lib/types/survey";
import type {
  HydratedSurveyItem,
  Survey as SurveyRecord,
} from "@/lib/types/survey-collector";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function allowsAnonymous(
  settings: Record<string, unknown> | undefined
): boolean {
  return settings?.allow_anonymous === true;
}

export function isSurveyInWindow(
  survey: Pick<SurveyRecord, "starts_at" | "ends_at">,
  now: Date = new Date()
): { ok: true } | { ok: false; reason: "not_started" | "ended" } {
  if (survey.starts_at && new Date(survey.starts_at) > now) {
    return { ok: false, reason: "not_started" };
  }
  if (survey.ends_at && new Date(survey.ends_at) < now) {
    return { ok: false, reason: "ended" };
  }
  return { ok: true };
}

/** URL segment for a public survey: slug when set, otherwise id. */
export function getPublicSurveyRef(
  survey: Pick<SurveyRecord, "id" | "slug">
): string {
  return survey.slug?.trim() || survey.id;
}

export function mapCollectorToVisitorSurvey(
  survey: SurveyRecord,
  items: HydratedSurveyItem[],
  couponId: string | null = null
): Survey {
  const questions: SurveyQuestion[] = items.map((item) => ({
    id: item.question.id,
    tenant_id: item.question.tenant_id,
    question: item.question.question,
    type: item.question.type as QuestionType,
    options: Array.isArray(item.question.options) ? item.question.options : [],
    order_index: item.order_index,
    item_id: item.id,
    required: item.required,
    item_settings: item.settings,
  }));

  return {
    id: survey.id,
    tenant_id: survey.tenant_id,
    coupon_id: couponId,
    title: survey.title,
    slug: survey.slug,
    description: survey.description,
    kind: survey.kind,
    status: survey.status,
    settings: survey.settings,
    starts_at: survey.starts_at,
    ends_at: survey.ends_at,
    questions,
  };
}
