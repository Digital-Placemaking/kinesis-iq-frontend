/**
 * Edit question modal component
 * Handles editing all types of survey questions
 */
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { updateQuestion, getQuestionById } from "@/app/actions";
import { X } from "lucide-react";
import type { QuestionType } from "@/lib/types/survey";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  questionId: string;
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

export default function EditQuestionModal({
  isOpen,
  onClose,
  tenantSlug,
  questionId,
}: EditQuestionModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<any | null>(null);

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("open_text");
  const [options, setOptions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [newOption, setNewOption] = useState("");

  // Load question data when modal opens
  useEffect(() => {
    if (isOpen && questionId) {
      setIsLoading(true);
      setError(null);
      getQuestionById(tenantSlug, questionId).then((result) => {
        setIsLoading(false);
        if (result.error || !result.question) {
          setError(result.error || "Failed to load question");
          return;
        }
        const q = result.question;
        setQuestion(q);
        setQuestionText(q.question || "");
        setQuestionType(q.type || "open_text");
        setOptions(Array.isArray(q.options) ? q.options : []);
        setIsActive(q.is_active ?? true);
      });
    }
  }, [isOpen, questionId, tenantSlug]);

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
      const result = await updateQuestion(tenantSlug, questionId, {
        question: questionText.trim(),
        type: questionType,
        options: requiresOptions(questionType) ? options : [],
        is_active: isActive,
      });

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Failed to update question");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Question" size="lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error && !question ? (
        <div className="py-8 text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : (
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
                      onChange={(e) =>
                        handleUpdateOption(index, e.target.value)
                      }
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
              onClick={onClose}
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </ActionButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
