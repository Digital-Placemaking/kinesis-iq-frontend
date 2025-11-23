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
import { X, Eye } from "lucide-react";
import type { QuestionType } from "@/lib/types/survey";
import QuestionNPS from "@/app/components/survey/questions/QuestionNPS";
import QuestionYesNo from "@/app/components/survey/questions/QuestionYesNo";
import QuestionInput from "@/app/components/survey/questions/QuestionInput";
import QuestionRadio from "@/app/components/survey/questions/QuestionRadio";
import QuestionCheckbox from "@/app/components/survey/questions/QuestionCheckbox";
import QuestionRating from "@/app/components/survey/questions/QuestionRating";
import QuestionLikert from "@/app/components/survey/questions/QuestionLikert";
import QuestionNumeric from "@/app/components/survey/questions/QuestionNumeric";
import QuestionSlider from "@/app/components/survey/questions/QuestionSlider";
import QuestionDate from "@/app/components/survey/questions/QuestionDate";
import QuestionTime from "@/app/components/survey/questions/QuestionTime";
import Card from "@/app/components/ui/Card";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  questionId: string;
}

// Question type options
const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "sentiment", label: "Sentiment Question" },
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

  // Preview state
  const [previewValue, setPreviewValue] = useState<any>(null);

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

  // Render preview based on question type
  const renderPreview = () => {
    if (!questionText.trim()) {
      return (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Enter question text to see preview
        </p>
      );
    }

    switch (questionType) {
      case "nps":
        return (
          <QuestionNPS
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
          />
        );
      case "yes_no":
        return (
          <QuestionYesNo
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
          />
        );
      case "open_text":
        return (
          <QuestionInput
            value={previewValue || ""}
            onChange={(val) => setPreviewValue(val)}
            placeholder="Your answer..."
            multiline
          />
        );
      case "single_choice":
        return (
          <QuestionRadio
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
            options={options.length > 0 ? options : ["Option 1", "Option 2"]}
          />
        );
      case "multiple_choice":
        return (
          <QuestionCheckbox
            value={previewValue || []}
            onChange={(val) => setPreviewValue(val)}
            options={options.length > 0 ? options : ["Option 1", "Option 2"]}
          />
        );
      case "rating_5":
        return (
          <QuestionRating
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
            min={1}
            max={5}
          />
        );
      case "likert_5":
        return (
          <QuestionLikert
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
            scale={5}
          />
        );
      case "likert_7":
        return (
          <QuestionLikert
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
            scale={7}
          />
        );
      case "numeric":
        return (
          <QuestionNumeric
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
            placeholder="Enter a number"
          />
        );
      case "slider":
        return (
          <QuestionSlider
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
            min={0}
            max={100}
            step={1}
          />
        );
      case "date":
        return (
          <QuestionDate
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
          />
        );
      case "time":
        return (
          <QuestionTime
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
          />
        );
      case "sentiment":
        return (
          <QuestionRadio
            value={previewValue}
            onChange={(val) => setPreviewValue(val)}
            options={
              options.length > 0
                ? options
                : [
                    "Very Negative",
                    "Negative",
                    "Neutral",
                    "Positive",
                    "Very Positive",
                  ]
            }
          />
        );
      case "ranked_choice":
        return (
          <div className="space-y-2">
            {options.length > 0 ? (
              options.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="text-sm font-medium text-zinc-500">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-black dark:text-zinc-50">
                    {opt}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Add options to see preview
              </p>
            )}
          </div>
        );
      default:
        return (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Preview not available for this question type
          </p>
        );
    }
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
            <div className="flex items-center gap-2 mb-1">
              <label
                htmlFor="question-type"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Question Type *
              </label>
              {questionType === "sentiment" && (
                <span className="inline-flex items-center rounded-full border border-green-500 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-400">
                  Records Sentiment
                </span>
              )}
            </div>
            <select
              id="question-type"
              value={questionType}
              onChange={(e) => {
                setQuestionType(e.target.value as QuestionType);
                // Clear options if switching to a type that doesn't need them
                if (!requiresOptions(e.target.value as QuestionType)) {
                  setOptions([]);
                }
                // Reset preview value when type changes
                setPreviewValue(null);
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
            {questionType === "sentiment" && (
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                This question type records sentiment data for the Community
                Pulse Dashboard. Responses are categorized as Happy (4-5),
                Neutral (3), or Concerned (1-2).
              </p>
            )}
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
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
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
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 cursor-pointer"
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

          {/* Preview Section */}
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Preview
              </h3>
            </div>
            <Card className="p-4" variant="elevated">
              <p className="mb-4 text-sm font-medium text-black dark:text-zinc-50">
                {questionText || "Your question will appear here"}
              </p>
              <div className="min-h-[60px]">{renderPreview()}</div>
            </Card>
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
