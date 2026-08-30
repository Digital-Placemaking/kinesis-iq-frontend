/**
 * Collapsible survey row for the admin Surveys tab with per-item builder actions.
 */

"use client";

import { ChevronDown, ExternalLink, Pencil, Plus } from "lucide-react";
import type { SurveyListEntry } from "@/lib/types";
import ActionButton from "@/app/components/ui/ActionButton";
import SurveyItemSortableList from "./SurveyItemSortableList";
import SurveySummaryPanel from "./SurveySummaryPanel";
import type { HydratedSurveyItem } from "@/lib/types";
import { canAddQuestionToSurvey } from "./survey-form-utils";

interface SurveyCollapsibleProps {
  entry: SurveyListEntry;
  tenantSlug: string;
  expanded: boolean;
  onToggle: () => void;
  questionTypeNames: Record<string, string>;
  onEdit: () => void;
  onAddQuestion?: () => void;
  onItemsOrderChange?: (items: HydratedSurveyItem[]) => void;
  onReorderItem?: (itemId: string, direction: "up" | "down") => void;
}

function StatusBadge({ status }: { status: SurveyListEntry["survey"]["status"] }) {
  const styles: Record<SurveyListEntry["survey"]["status"], string> = {
    draft:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    closed:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function KindBadge({ kind }: { kind: SurveyListEntry["survey"]["kind"] }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
      {kind}
    </span>
  );
}

export default function SurveyCollapsible({
  entry,
  tenantSlug,
  expanded,
  onToggle,
  questionTypeNames,
  onEdit,
  onAddQuestion,
  onItemsOrderChange,
  onReorderItem,
}: SurveyCollapsibleProps) {
  const { survey, items, summary } = entry;
  const questionCount = items.length;
  const responseCount = summary.total_responses;
  const canAddQuestion = canAddQuestionToSurvey(survey.kind, questionCount);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-zinc-50 sm:items-center sm:px-6 dark:hover:bg-zinc-800/50"
      >
        <ChevronDown
          className={`mt-0.5 h-5 w-5 shrink-0 text-zinc-500 transition-transform sm:mt-0 ${
            expanded ? "rotate-180" : ""
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
              {survey.title}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={survey.kind} />
              <StatusBadge status={survey.status} />
              {survey.status === "active" && (
                <a
                  href={`/${tenantSlug}/survey/${survey.slug || survey.id}`}
                  target="_blank"
                  rel="noreferrer"
                  title="View public page"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View public page
                </a>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {questionCount} {questionCount === 1 ? "question" : "questions"}
            </span>
            <span>
              {responseCount}{" "}
              {responseCount === 1 ? "response" : "responses"}
            </span>
            {survey.slug && <span>{survey.slug}</span>}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-800">
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
            <ActionButton
              type="button"
              onClick={() => onEdit()}
              variant="secondary"
            >
              <span className="flex items-center gap-1.5">
                <Pencil className="h-4 w-4" />
                Edit
              </span>
            </ActionButton>
            {onAddQuestion && canAddQuestion && (
              <ActionButton
                type="button"
                icon={Plus}
                onClick={() => onAddQuestion()}
              >
                Add Question
              </ActionButton>
            )}
            {onAddQuestion && !canAddQuestion && survey.kind === "poll" && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Polls are limited to one question.
              </p>
            )}
          </div>

          <SurveySummaryPanel
            tenantSlug={tenantSlug}
            surveyId={survey.id}
            surveyTitle={survey.title}
            initialSummary={summary}
            items={items}
          />

          {items.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No questions linked to this survey yet.
            </p>
          ) : onItemsOrderChange ? (
            <SurveyItemSortableList
              items={items}
              summary={summary}
              surveyId={survey.id}
              surveyTitle={survey.title}
              tenantSlug={tenantSlug}
              questionTypeNames={questionTypeNames}
              onItemsOrderChange={onItemsOrderChange}
              onReorderItem={onReorderItem}
            />
          ) : (
            <ol className="space-y-3">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                  <p className="text-sm text-zinc-900 dark:text-zinc-50">
                    {index + 1}. {item.question.question}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
