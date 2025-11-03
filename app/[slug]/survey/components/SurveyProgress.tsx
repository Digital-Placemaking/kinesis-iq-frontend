interface SurveyProgressProps {
  current: number;
  total: number;
}

export default function SurveyProgress({
  current,
  total,
}: SurveyProgressProps) {
  // Guard against division by zero
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          Question {current} of {total}
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
