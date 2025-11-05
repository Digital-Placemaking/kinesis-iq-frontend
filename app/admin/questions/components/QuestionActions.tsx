/**
 * Question actions component
 * Handles reordering and status toggling for survey questions
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  reorderQuestion,
  toggleQuestionStatus,
  deleteQuestion,
} from "@/app/actions";
import EditQuestionModal from "./EditQuestionModal";
import DeleteConfirmationModal from "@/app/components/ui/DeleteConfirmationModal";
import {
  ArrowUp,
  ArrowDown,
  Edit,
  ToggleLeft,
  ToggleRight,
  Trash2,
  BarChart3,
} from "lucide-react";
import QuestionResultsModal from "./QuestionResultsModal";

interface QuestionActionsProps {
  tenantSlug: string;
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  isActive: boolean;
  questionText: string;
  questionType: string;
}

export default function QuestionActions({
  tenantSlug,
  questionId,
  questionIndex,
  totalQuestions,
  isActive,
  questionText,
  questionType,
}: QuestionActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const handleMoveUp = () => {
    if (questionIndex === 0) return; // Already at top

    setError(null);
    startTransition(async () => {
      try {
        const result = await reorderQuestion(tenantSlug, questionId, "up");
        console.log("reorderQuestion result:", result);
        if (result.success) {
          router.refresh();
        } else {
          const errorMsg = result.error || "Failed to move question up";
          setError(errorMsg);
          console.error("Reorder question (up) failed:", errorMsg);
        }
      } catch (err) {
        console.error("Exception in handleMoveUp:", err);
        setError("An unexpected error occurred");
      }
    });
  };

  const handleMoveDown = () => {
    if (questionIndex === totalQuestions - 1) return; // Already at bottom

    setError(null);
    startTransition(async () => {
      try {
        const result = await reorderQuestion(tenantSlug, questionId, "down");
        console.log("reorderQuestion result:", result);
        if (result.success) {
          router.refresh();
        } else {
          const errorMsg = result.error || "Failed to move question down";
          setError(errorMsg);
          console.error("Reorder question (down) failed:", errorMsg);
        }
      } catch (err) {
        console.error("Exception in handleMoveDown:", err);
        setError("An unexpected error occurred");
      }
    });
  };

  const handleToggleStatus = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleQuestionStatus(tenantSlug, questionId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Failed to toggle question status");
      }
    });
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteQuestion(tenantSlug, questionId);
      if (result.success) {
        setIsDeleteModalOpen(false);
        router.refresh();
      } else {
        setError(result.error || "Failed to delete question");
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
          onClick={handleMoveUp}
          disabled={isPending || questionIndex === 0}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          title="Move up"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          onClick={handleMoveDown}
          disabled={isPending || questionIndex === totalQuestions - 1}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          title="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          onClick={handleToggleStatus}
          disabled={isPending}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          title={isActive ? "Deactivate" : "Activate"}
        >
          {isActive ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-zinc-400" />
          )}
        </button>
        <button
          onClick={() => setIsResultsModalOpen(true)}
          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          title="View Results"
        >
          <BarChart3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={isPending}
          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tenantSlug={tenantSlug}
        questionId={questionId}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete Question"
        isLoading={isPending}
      />
      <QuestionResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        tenantSlug={tenantSlug}
        questionId={questionId}
        questionText={questionText}
        questionType={questionType}
      />
    </div>
  );
}
