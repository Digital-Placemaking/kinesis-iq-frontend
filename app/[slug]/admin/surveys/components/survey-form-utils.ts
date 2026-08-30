import type { SurveyRecord } from "@/lib/types";

export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function getAllowAnonymousSetting(
  settings: Record<string, unknown> | undefined
): boolean {
  return settings?.allow_anonymous === true;
}

export function buildSurveySettings(allowAnonymous: boolean): Record<string, unknown> {
  return { allow_anonymous: allowAnonymous };
}

export function nextSurveyItemOrderIndex(
  items: Array<{ order_index: number }>
): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((item) => item.order_index)) + 1;
}

export const POLL_MAX_QUESTIONS = 1;

export function isPollAtQuestionLimit(
  kind: SurveyRecord["kind"],
  itemCount: number
): boolean {
  return kind === "poll" && itemCount >= POLL_MAX_QUESTIONS;
}

export function canAddQuestionToSurvey(
  kind: SurveyRecord["kind"],
  itemCount: number
): boolean {
  return !isPollAtQuestionLimit(kind, itemCount);
}

export type SurveyFormValues = {
  title: string;
  slug: string;
  description: string;
  kind: SurveyRecord["kind"];
  status: SurveyRecord["status"];
  startsAt: string;
  endsAt: string;
  allowAnonymous: boolean;
};

export function emptySurveyFormValues(): SurveyFormValues {
  return {
    title: "",
    slug: "",
    description: "",
    kind: "survey",
    status: "draft",
    startsAt: "",
    endsAt: "",
    allowAnonymous: false,
  };
}

export function surveyToFormValues(survey: SurveyRecord): SurveyFormValues {
  return {
    title: survey.title,
    slug: survey.slug ?? "",
    description: survey.description ?? "",
    kind: survey.kind,
    status: survey.status,
    startsAt: toDatetimeLocalValue(survey.starts_at),
    endsAt: toDatetimeLocalValue(survey.ends_at),
    allowAnonymous: getAllowAnonymousSetting(survey.settings),
  };
}
