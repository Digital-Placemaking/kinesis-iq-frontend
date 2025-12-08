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
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border-2 transition-all duration-250 ${
              value === rating
                ? "border-primary bg-primary/10 text-primary shadow-lg scale-105"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/30 hover:scale-105 active:scale-95"
            }`}
          >
            <span className="text-2xl sm:text-3xl font-bold">{rating}</span>
          </button>
        ))}
      </div>
      <div className="h-16 sm:h-20 flex items-center justify-center">
        {value ? (
          <div className="text-center">
            <p className="text-base sm:text-lg font-semibold text-primary">
              {value} out of {max}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              1 being &apos;excellent&apos; and {max} being strongly
              dissatisfied
            </p>
          </div>
        ) : required ? (
          <p className="text-center text-sm text-destructive">Required</p>
        ) : (
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              1 being &apos;excellent&apos; and {max} being strongly
              dissatisfied
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
