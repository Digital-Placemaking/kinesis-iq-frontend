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
    <div className="flex items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstQuestion || isSubmitting}
        className="flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-250 hover:border-primary/50 hover:bg-muted/50 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {isLastQuestion ? (
        <button
          type="submit"
          disabled={isNextDisabled || isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold shadow-lg transition-all duration-250 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSubmitting ? "Submitting..." : "Submit Survey"}
          {!isSubmitting && <ChevronRight className="h-4 w-4" />}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold shadow-lg transition-all duration-250 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
