/**
 * app/components/survey/questions/QuestionRating.tsx
 * Rating question component.
 * Renders a rating scale (1-5 by default) for rating-type survey questions.
 */

interface QuestionRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
}

export default function QuestionRating({
  value,
  onChange,
  min = 1,
  max = 5,
  required = false,
}: QuestionRatingProps) {
  const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="flex items-center gap-3">
      {ratings.map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${
            value === rating
              ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-700 dark:hover:bg-zinc-800"
          }`}
        >
          <span className="text-lg font-semibold">{rating}</span>
        </button>
      ))}
      {value && (
        <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
          {value} out of {max}
        </span>
      )}
      {required && value === null && (
        <span className="ml-2 text-xs text-red-500">Required</span>
      )}
    </div>
  );
}
