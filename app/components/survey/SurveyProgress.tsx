// SurveyProgress
// Displays progress bar and question counter for survey forms.
// Used in: app/[slug]/survey/page.tsx, app/[slug]/coupons/[couponId]/survey/page.tsx

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
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          Question {currentVal} of {totalVal}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
