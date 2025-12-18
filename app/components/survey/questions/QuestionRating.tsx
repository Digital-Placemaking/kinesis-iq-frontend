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
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
              value === rating
                ? "border-primary bg-primary/10 text-primary shadow-md scale-105"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/30 active:scale-95"
            }`}
          >
            <span className="text-xl sm:text-2xl font-bold">{rating}</span>
          </button>
        ))}
      </div>
      <div className="min-h-12 flex items-center justify-center">
        {value ? (
          <div className="text-center">
            <p className="text-sm sm:text-base font-semibold text-primary">
              {value} out of {max}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              1 being &apos;excellent&apos; and {max} being strongly dissatisfied
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            1 being &apos;excellent&apos; and {max} being strongly dissatisfied
          </p>
        )}
      </div>
    </div>
  );
}
