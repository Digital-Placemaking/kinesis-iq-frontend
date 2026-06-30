/**
 * Survey-context actions for a survey_items row.
 * Reorder/remove operate on survey_items; question edits use the shared bank.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeSurveyItem } from "@/app/actions";
import EditQuestionModal from "../../questions/components/EditQuestionModal";
import EditSurveyItemModal from "./EditSurveyItemModal";
import DeleteConfirmationModal from "@/app/components/ui/DeleteConfirmationModal";
import QuestionResultsModal from "../../questions/components/QuestionResultsModal";
import type { HydratedSurveyItem } from "@/lib/types";
import {
  ArrowUp,
  ArrowDown,
  Edit,
  Settings2,
  Trash2,
  BarChart3,
} from "lucide-react";

const SHARED_BANK_WARNING =
  "This question lives in the shared question bank. Changes to its text, type, or options will affect every survey that uses it.";

interface SurveyItemActionsProps {
  tenantSlug: string;
  surveyId: string;
  surveyTitle: string;
  item: HydratedSurveyItem;
  itemIndex: number;
  totalItems: number;
  /** Optimistic reorder — UI updates immediately; persistence is handled upstream. */
  onReorder?: (direction: "up" | "down") => void;
}

export default function SurveyItemActions({
  tenantSlug,
  surveyId,
  surveyTitle,
  item,
  itemIndex,
  totalItems,
  onReorder,
}: SurveyItemActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const handleMove = (direction: "up" | "down") => {
    if (onReorder) {
      onReorder(direction);
      return;
    }
  };

  const handleRemoveConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeSurveyItem(tenantSlug, item.id);
      if (result.success) {
        setIsRemoveOpen(false);
        router.refresh();
      } else {
        setError(result.error || "Failed to remove question from survey");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleMove("up")}
          disabled={itemIndex === 0}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
          title="Move up"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleMove("down")}
          disabled={itemIndex === totalItems - 1}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
          title="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsResultsOpen(true)}
          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer"
          title="View results for this survey"
        >
          <BarChart3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsEditItemOpen(true)}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
          title="Edit item settings"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsEditQuestionOpen(true)}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
          title="Edit question (shared bank)"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsRemoveOpen(true)}
          disabled={isPending}
          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
          title="Remove from survey"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <EditQuestionModal
        isOpen={isEditQuestionOpen}
        onClose={() => setIsEditQuestionOpen(false)}
        tenantSlug={tenantSlug}
        questionId={item.question_id}
        sharedBankWarning={SHARED_BANK_WARNING}
      />

      <EditSurveyItemModal
        isOpen={isEditItemOpen}
        onClose={() => setIsEditItemOpen(false)}
        tenantSlug={tenantSlug}
        item={isEditItemOpen ? item : null}
      />

      <DeleteConfirmationModal
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={handleRemoveConfirm}
        title="Remove Question from Survey"
        message="Remove this question from the survey only? The question stays in the bank and can be added to other surveys."
        confirmText="Remove from Survey"
        isLoading={isPending}
      />

      <QuestionResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        tenantSlug={tenantSlug}
        questionId={item.question_id}
        questionText={item.question.question}
        questionType={item.question.type}
        surveyId={surveyId}
        surveyTitle={surveyTitle}
      />
    </div>
  );
}
