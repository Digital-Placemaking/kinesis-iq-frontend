/**
 * Collapsible survey row for the admin Surveys tab with per-item builder actions.
 */

"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Plus } from "lucide-react";
import type { SurveyListEntry } from "@/lib/types";
import ActionButton from "@/app/components/ui/ActionButton";
import SurveyItemActions from "./SurveyItemActions";

interface SurveyCollapsibleProps {
  entry: SurveyListEntry;
  tenantSlug: string;
  defaultExpanded?: boolean;
  questionTypeNames: Record<string, string>;
  onEdit: () => void;
  onAddQuestion?: () => void;
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
  defaultExpanded = false,
  questionTypeNames,
  onEdit,
  onAddQuestion,
}: SurveyCollapsibleProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { survey, items, summary } = entry;
  const questionCount = items.length;
  const responseCount = summary.total_responses;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-zinc-50 sm:items-center sm:px-6 dark:hover:bg-zinc-800/50"
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
      </button>

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
            {onAddQuestion && (
              <ActionButton
                type="button"
                icon={Plus}
                onClick={() => onAddQuestion()}
              >
                Add Question
              </ActionButton>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No questions linked to this survey yet.
            </p>
          ) : (
            <ol className="space-y-3">
              {items.map((item, index) => {
                const typeName =
                  questionTypeNames[item.question.type] || item.question.type;
                const perQuestionCount =
                  summary.question_totals.find(
                    (total) => total.question_id === item.question_id
                  )?.response_count ?? 0;

                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            {index + 1}.
                          </span>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {typeName}
                          </span>
                          {item.required && (
                            <span className="inline-flex items-center rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-900 dark:text-zinc-50">
                          {item.question.question}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2 sm:items-end">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {perQuestionCount}{" "}
                          {perQuestionCount === 1 ? "response" : "responses"}
                        </span>
                        <SurveyItemActions
                          tenantSlug={tenantSlug}
                          surveyId={survey.id}
                          surveyTitle={survey.title}
                          item={item}
                          itemIndex={index}
                          totalItems={items.length}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
