/**
 * app/components/survey/SurveyProgress.tsx
 * Survey progress component.
 * Displays progress bar and question counter for survey forms.
 */

interface SurveyProgressProps {
  current?: number;
  total?: number;
  currentQuestion?: number;
  totalQuestions?: number;
}

export default function SurveyProgress({
  current,
  total,
  currentQuestion,
  totalQuestions,
}: SurveyProgressProps) {
  // Support both prop name variations for backward compatibility
  const currentVal = current ?? currentQuestion ?? 0;
  const totalVal = total ?? totalQuestions ?? 0;

  // Guard against division by zero
  const percentage = totalVal > 0 ? (currentVal / totalVal) * 100 : 0;

  return (
    <div className="mb-6 sm:mb-8" data-survey-progress>
      <div className="mb-2 flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
        <span>
          Question {currentVal} of {totalVal}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}
