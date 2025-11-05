"use client";

import { useState, useEffect } from "react";
import { getQuestionResults } from "@/app/actions";
import type { QuestionResult } from "@/app/actions";
import Modal from "@/app/components/ui/Modal";
import Spinner from "@/app/components/ui/Spinner";
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Calendar,
  Clock,
} from "lucide-react";

interface QuestionResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  questionId: string;
  questionText: string;
  questionType: string;
}

/**
 * Modal component to display question results
 * Shows different visualizations based on question type
 */
export default function QuestionResultsModal({
  isOpen,
  onClose,
  tenantSlug,
  questionId,
  questionText,
  questionType,
}: QuestionResultsModalProps) {
  const [results, setResults] = useState<QuestionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && questionId) {
      fetchResults();
    } else {
      setResults(null);
      setError(null);
    }
  }, [isOpen, questionId]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const { results: data, error: err } = await getQuestionResults(
        tenantSlug,
        questionId
      );
      if (err) {
        setError(err);
      } else {
        setResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Question Results">
      <div className="space-y-6">
        {/* Question Info */}
        <div>
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Question
          </h3>
          <p className="mt-1 text-base font-medium text-black dark:text-zinc-50">
            {questionText}
          </p>
          {results && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {results.totalResponses} response
              {results.totalResponses !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* No Responses */}
        {results && results.totalResponses === 0 && (
          <div className="rounded-lg bg-zinc-50 p-6 text-center dark:bg-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No responses yet for this question.
            </p>
          </div>
        )}

        {/* Results Visualization */}
        {results && results.totalResponses > 0 && (
          <div className="space-y-6">
            {/* Multiple Choice / Single Choice / Ranked Choice */}
            {results.choiceCounts && <ChoiceResults results={results} />}

            {/* Yes/No */}
            {results.booleanCounts && <BooleanResults results={results} />}

            {/* Numeric / NPS / Likert / Rating / Slider / Sentiment */}
            {results.numericStats && (
              <NumericResults results={results} questionType={questionType} />
            )}

            {/* Open Text */}
            {results.textResponses && <TextResults results={results} />}

            {/* Date */}
            {results.dateCounts && <DateResults results={results} />}

            {/* Time */}
            {results.timeCounts && <TimeResults results={results} />}
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Choice-based results (multiple/single/ranked choice)
 */
function ChoiceResults({ results }: { results: QuestionResult }) {
  if (!results.choiceCounts || !results.options) return null;

  const maxCount = Math.max(...Object.values(results.choiceCounts));
  const total = results.totalResponses;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-500" />
        <h4 className="text-sm font-semibold text-black dark:text-zinc-50">
          Response Distribution
        </h4>
      </div>
      <div className="space-y-3">
        {results.options.map((option) => {
          const count = results.choiceCounts![option] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={option}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-black dark:text-zinc-50">
                  {option}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {count} ({percentage.toFixed(1)}%)
                </span>
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
  );
}

/**
 * Boolean results (yes/no)
 */
function BooleanResults({ results }: { results: QuestionResult }) {
  if (!results.booleanCounts) return null;

  const { yes, no } = results.booleanCounts;
  const total = yes + no;
  const yesPercentage = total > 0 ? (yes / total) * 100 : 0;
  const noPercentage = total > 0 ? (no / total) * 100 : 0;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-500" />
        <h4 className="text-sm font-semibold text-black dark:text-zinc-50">
          Response Distribution
        </h4>
      </div>
      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Yes
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {yes} ({yesPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${yesPercentage}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              No
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {no} ({noPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${noPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Numeric results (NPS, Likert, Rating, Numeric, Slider, Sentiment)
 */
function NumericResults({
  results,
  questionType,
}: {
  results: QuestionResult;
  questionType: string;
}) {
  if (!results.numericStats) return null;

  const { min, max, mean, median, distribution } = results.numericStats;
  const maxCount = Math.max(...Object.values(distribution), 1);

  // Determine range based on question type
  let rangeStart = min;
  let rangeEnd = max;
  if (questionType === "nps") {
    rangeStart = 0;
    rangeEnd = 10;
  } else if (questionType === "likert_5" || questionType === "rating_5") {
    rangeStart = 1;
    rangeEnd = 5;
  } else if (questionType === "likert_7") {
    rangeStart = 1;
    rangeEnd = 7;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-500" />
        <h4 className="text-sm font-semibold text-black dark:text-zinc-50">
          Statistics
        </h4>
      </div>

      {/* Statistics Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Mean</p>
          <p className="mt-1 text-lg font-semibold text-black dark:text-zinc-50">
            {mean.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Median</p>
          <p className="mt-1 text-lg font-semibold text-black dark:text-zinc-50">
            {median.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Min</p>
          <p className="mt-1 text-lg font-semibold text-black dark:text-zinc-50">
            {min}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Max</p>
          <p className="mt-1 text-lg font-semibold text-black dark:text-zinc-50">
            {max}
          </p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div>
        <h5 className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Distribution
        </h5>
        <div className="space-y-2">
          {Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => {
            const value = rangeStart + i;
            const count = distribution[value] || 0;
            const percentage =
              results.totalResponses > 0
                ? (count / results.totalResponses) * 100
                : 0;
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={value}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-black dark:text-zinc-50">
                    {value}
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
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
    </div>
  );
}

/**
 * Text results (open text)
 */
function TextResults({ results }: { results: QuestionResult }) {
  if (!results.textResponses) return null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-500" />
        <h4 className="text-sm font-semibold text-black dark:text-zinc-50">
          Text Responses
        </h4>
      </div>
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {results.textResponses.map((response, index) => (
          <div
            key={index}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <p className="text-sm text-black dark:text-zinc-50">{response}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Date results
 */
function DateResults({ results }: { results: QuestionResult }) {
  if (!results.dateCounts) return null;

  const sortedDates = Object.entries(results.dateCounts).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );
  const maxCount = Math.max(...Object.values(results.dateCounts));

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-500" />
        <h4 className="text-sm font-semibold text-black dark:text-zinc-50">
          Date Distribution
        </h4>
      </div>
      <div className="space-y-2">
        {sortedDates.map(([date, count]) => {
          const percentage =
            results.totalResponses > 0
              ? (count / results.totalResponses) * 100
              : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={date}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-black dark:text-zinc-50">
                  {new Date(date).toLocaleDateString()}
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {count} ({percentage.toFixed(1)}%)
                </span>
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
  );
}

/**
 * Time results
 */
function TimeResults({ results }: { results: QuestionResult }) {
  if (!results.timeCounts) return null;

  const sortedTimes = Object.entries(results.timeCounts).sort();
  const maxCount = Math.max(...Object.values(results.timeCounts));

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-500" />
        <h4 className="text-sm font-semibold text-black dark:text-zinc-50">
          Time Distribution
        </h4>
      </div>
      <div className="space-y-2">
        {sortedTimes.map(([time, count]) => {
          const percentage =
            results.totalResponses > 0
              ? (count / results.totalResponses) * 100
              : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={time}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-black dark:text-zinc-50">
                  {time}
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {count} ({percentage.toFixed(1)}%)
                </span>
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
  );
}
