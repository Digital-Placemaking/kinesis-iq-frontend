/**
 * Add question modal component
 * Handles creating new survey questions of any type
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { createQuestion } from "@/app/actions";
import type { QuestionType } from "@/lib/types/survey";

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
}

// Question type options
const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "sentiment", label: "Sentiment" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "single_choice", label: "Single Choice" },
  { value: "ranked_choice", label: "Ranked Choice" },
  { value: "likert_5", label: "Likert Scale (5)" },
  { value: "likert_7", label: "Likert Scale (7)" },
  { value: "nps", label: "NPS" },
  { value: "rating_5", label: "Rating (5)" },
  { value: "yes_no", label: "Yes/No" },
  { value: "open_text", label: "Open Text" },
  { value: "numeric", label: "Numeric" },
  { value: "slider", label: "Slider" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
];

export default function AddQuestionModal({
  isOpen,
  onClose,
  tenantSlug,
}: AddQuestionModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("open_text");
  const [options, setOptions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [newOption, setNewOption] = useState("");

  // Reset form when modal closes
  const handleClose = () => {
    setQuestionText("");
    setQuestionType("open_text");
    setOptions([]);
    setIsActive(true);
    setNewOption("");
    setError(null);
    onClose();
  };

  // Check if question type requires options
  const requiresOptions = (type: QuestionType): boolean => {
    return [
      "multiple_choice",
      "single_choice",
      "ranked_choice",
      "sentiment",
    ].includes(type);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }

    if (requiresOptions(questionType) && options.length === 0) {
      setError("At least one option is required for this question type");
      return;
    }

    startTransition(async () => {
      const result = await createQuestion(tenantSlug, {
        question: questionText.trim(),
        type: questionType,
        options: requiresOptions(questionType) ? options : [],
        is_active: isActive,
      });

      if (result.success) {
        router.refresh();
        handleClose();
      } else {
        setError(result.error || "Failed to create question");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Question"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label
            htmlFor="question-text"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Question Text *
          </label>
          <textarea
            id="question-text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            placeholder="Enter your question here..."
            required
          />
        </div>

        {/* Question Type */}
        <div>
          <label
            htmlFor="question-type"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Question Type *
          </label>
          <select
            id="question-type"
            value={questionType}
            onChange={(e) => {
              setQuestionType(e.target.value as QuestionType);
              // Clear options if switching to a type that doesn't need them
              if (!requiresOptions(e.target.value as QuestionType)) {
                setOptions([]);
              }
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            required
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Options (for choice-based questions) */}
        {requiresOptions(questionType) && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Options *
            </label>
            <div className="mt-1 space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    aria-label="Remove option"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                  placeholder="Add new option..."
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700"
          />
          <label
            htmlFor="is-active"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Active (show in surveys)
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            disabled={isPending}
          >
            Cancel
          </button>
          <ActionButton
            type="submit"
            disabled={isPending}
            className="min-w-[100px]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Creating...
              </span>
            ) : (
              "Create Question"
            )}
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
}
