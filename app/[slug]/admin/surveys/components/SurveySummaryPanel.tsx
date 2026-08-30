/**
 * Survey-level response statistics inside an expanded survey row.
 * Fetches fresh aggregates via getSurveySummary; per-question drill-down
 * reuses QuestionResultsModal.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, MessageSquare, Users } from "lucide-react";
import { getSurveySummary } from "@/app/actions";
import Card from "@/app/components/ui/Card";
import Spinner from "@/app/components/ui/Spinner";
import QuestionResultsModal from "../../questions/components/QuestionResultsModal";
import type { HydratedSurveyItem, SurveySummary } from "@/lib/types";

interface SurveySummaryPanelProps {
  tenantSlug: string;
  surveyId: string;
  surveyTitle: string;
  initialSummary: SurveySummary;
  items: HydratedSurveyItem[];
}

interface SelectedQuestion {
  questionId: string;
  questionText: string;
  questionType: string;
}

export default function SurveySummaryPanel({
  tenantSlug,
  surveyId,
  surveyTitle,
  initialSummary,
  items,
}: SurveySummaryPanelProps) {
  const [summary, setSummary] = useState<SurveySummary>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] =
    useState<SelectedQuestion | null>(null);

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const { summary: data, error: err } = await getSurveySummary(
          tenantSlug,
          surveyId
        );
        if (cancelled) return;
        if (err) {
          setError(err);
        } else if (data) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load survey summary"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [tenantSlug, surveyId]);

  const questionTypeById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.question_id, item.question.type);
    }
    return map;
  }, [items]);

  const sortedTotals = useMemo(
    () =>
      [...summary.question_totals].sort(
        (a, b) => a.order_index - b.order_index
      ),
    [summary.question_totals]
  );

  const maxCount = Math.max(
    ...sortedTotals.map((total) => total.response_count),
    1
  );

  return (
    <>
      <Card className="mb-4 p-4 sm:p-5" variant="elevated">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Response Summary
            </h3>
          </div>
          {loading && <Spinner className="h-4 w-4" />}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Total Responses
              </p>
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {summary.total_responses}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Unique Sessions
              </p>
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {summary.unique_sessions}
            </p>
          </div>
        </div>

        {sortedTotals.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No questions in this survey yet.
          </p>
        ) : summary.total_responses === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No responses yet for this survey.
          </p>
        ) : (
          <div>
            <h4 className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Responses per Question
            </h4>
            <div className="space-y-3">
              {sortedTotals.map((total) => {
                const count = total.response_count;
                const percentage =
                  summary.total_responses > 0
                    ? (count / summary.total_responses) * 100
                    : 0;
                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const questionType =
                  questionTypeById.get(total.question_id) ?? "open_text";

                return (
                  <div key={total.question_id}>
                    <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <p className="min-w-0 flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {total.question_text}
                      </p>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedQuestion({
                              questionId: total.question_id,
                              questionText: total.question_text,
                              questionType,
                            })
                          }
                          className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {selectedQuestion && (
        <QuestionResultsModal
          isOpen={selectedQuestion !== null}
          onClose={() => setSelectedQuestion(null)}
          tenantSlug={tenantSlug}
          questionId={selectedQuestion.questionId}
          questionText={selectedQuestion.questionText}
          questionType={selectedQuestion.questionType}
          surveyId={surveyId}
          surveyTitle={surveyTitle}
        />
      )}
    </>
  );
}
