/**
 * Add a question to a survey — create new in bank or pick from bank search.
 */

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { addSurveyItem, searchQuestionBank } from "@/app/actions";
import type { HydratedSurveyItem, SurveyKind } from "@/lib/types";
import type { Question } from "@/lib/types/question";
import AddQuestionModal from "../../questions/components/AddQuestionModal";
import { canAddQuestionToSurvey, nextSurveyItemOrderIndex } from "./survey-form-utils";

const QUESTION_TYPE_NAMES: Record<string, string> = {
  sentiment: "Sentiment",
  multiple_choice: "Multiple Choice",
  single_choice: "Single Choice",
  ranked_choice: "Ranked Choice",
  likert_5: "Likert (5)",
  likert_7: "Likert (7)",
  nps: "NPS",
  rating_5: "Rating (5)",
  yes_no: "Yes/No",
  open_text: "Open Text",
  numeric: "Numeric",
  slider: "Slider",
  date: "Date",
  time: "Time",
};

type TabId = "create" | "bank";

interface AddQuestionToSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  surveyId: string;
  surveyTitle: string;
  surveyKind: SurveyKind;
  surveyItems: HydratedSurveyItem[];
}

export default function AddQuestionToSurveyModal({
  isOpen,
  onClose,
  tenantSlug,
  surveyId,
  surveyTitle,
  surveyKind,
  surveyItems,
}: AddQuestionToSurveyModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("create");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Question[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isAdding, startAddTransition] = useTransition();
  const [addingQuestionId, setAddingQuestionId] = useState<string | null>(null);

  const linkedQuestionIds = useMemo(
    () => new Set(surveyItems.map((item) => item.question_id)),
    [surveyItems]
  );

  const nextOrderIndex = useMemo(
    () => nextSurveyItemOrderIndex(surveyItems),
    [surveyItems]
  );

  const atPollLimit = !canAddQuestionToSurvey(surveyKind, surveyItems.length);

  const reset = () => {
    setActiveTab("create");
    setQuery("");
    setResults([]);
    setSearchError(null);
    setActionError(null);
    setAddingQuestionId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCompleted = () => {
    router.refresh();
    handleClose();
  };

  useEffect(() => {
    if (!isOpen || activeTab !== "bank") return;

    const timeout = setTimeout(() => {
      startSearchTransition(async () => {
        setSearchError(null);
        const { questions, error } = await searchQuestionBank(
          tenantSlug,
          query.trim() || undefined
        );

        if (error) {
          setSearchError(error);
          setResults([]);
          return;
        }

        setResults(questions ?? []);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [isOpen, activeTab, query, tenantSlug]);

  const handleAddFromBank = (questionId: string) => {
    if (atPollLimit) {
      setActionError("Polls can only have one question");
      return;
    }

    if (linkedQuestionIds.has(questionId)) {
      setActionError("This question is already in the survey");
      return;
    }

    setActionError(null);
    setAddingQuestionId(questionId);

    startAddTransition(async () => {
      const result = await addSurveyItem(tenantSlug, {
        survey_id: surveyId,
        question_id: questionId,
        order_index: nextOrderIndex,
        required: true,
      });

      setAddingQuestionId(null);

      if (result.success) {
        router.refresh();
        handleClose();
      } else {
        setActionError(result.error || "Failed to add question to survey");
      }
    });
  };

  const visibleResults = results.filter(
    (question) => !linkedQuestionIds.has(question.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add Question — ${surveyTitle}`}
      size="lg"
    >
      {atPollLimit ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This poll already has a question. Remove it before adding another, or
            use a survey type for multiple questions.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "create"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Create new
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "bank"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          From bank
        </button>
      </div>

      {activeTab === "create" ? (
        <AddQuestionModal
          isOpen={isOpen}
          onClose={handleClose}
          tenantSlug={tenantSlug}
          surveyId={surveyId}
          surveyItems={surveyItems}
          variant="panel"
          onCompleted={handleCompleted}
        />
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search question bank..."
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          {searchError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {searchError}
            </div>
          )}

          {actionError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {actionError}
            </div>
          )}

          {isSearching ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : visibleResults.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {results.length > 0 && linkedQuestionIds.size > 0
                ? "All matching questions are already in this survey."
                : "No questions found in the bank."}
            </p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {visibleResults.map((question) => {
                const isAddingThis = addingQuestionId === question.id && isAdding;
                const typeName =
                  QUESTION_TYPE_NAMES[question.type] || question.type;

                return (
                  <li
                    key={question.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="mb-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {typeName}
                      </span>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {question.question}
                      </p>
                    </div>
                    <ActionButton
                      type="button"
                      onClick={() => handleAddFromBank(question.id)}
                      disabled={isAdding}
                      className="shrink-0"
                    >
                      {isAddingThis ? (
                        <Spinner size="sm" />
                      ) : (
                        "Add"
                      )}
                    </ActionButton>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </Modal>
  );
}
