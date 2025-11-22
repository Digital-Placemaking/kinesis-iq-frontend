/**
 * app/components/survey/SurveyNavigation.tsx
 * Survey navigation component.
 * Provides Previous/Next/Submit navigation buttons for survey forms.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

interface SurveyNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export default function SurveyNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  isNextDisabled = false,
  isSubmitting = false,
}: SurveyNavigationProps) {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;

  return (
    <div className="flex items-center justify-between gap-4 pt-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstQuestion || isSubmitting}
        className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {isLastQuestion ? (
        <button
          type="submit"
          disabled={isNextDisabled || isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Survey"}
          {!isSubmitting && <ChevronRight className="h-4 w-4" />}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
