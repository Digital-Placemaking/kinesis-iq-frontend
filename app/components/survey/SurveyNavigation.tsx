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
  onSkip?: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export default function SurveyNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSkip,
  isNextDisabled = false,
  isSubmitting = false,
}: SurveyNavigationProps) {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;

  return (
    <div className="flex items-center justify-between gap-2 pt-4 mt-auto">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstQuestion || isSubmitting}
        className="flex items-center gap-1.5 rounded-lg border-2 border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Skip this question
        </button>
      )}

      {isLastQuestion ? (
        <button
          type="submit"
          disabled={isNextDisabled || isSubmitting}
          className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Survey"}
          {!isSubmitting && <ChevronRight className="h-4 w-4" />}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
