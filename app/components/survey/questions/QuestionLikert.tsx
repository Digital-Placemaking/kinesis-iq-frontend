/**
 * app/components/survey/questions/QuestionLikert.tsx
 * Likert scale question component.
 * Renders Likert scale questions supporting 5-point and 7-point scales with optional labels.
 */

"use client";

interface QuestionLikertProps {
  value: number | null;
  onChange: (value: number) => void;
  scale: 5 | 7;
  labels?: {
    left?: string;
    right?: string;
  };
}

export default function QuestionLikert({
  value,
  onChange,
  scale,
  labels,
}: QuestionLikertProps) {
  const points = Array.from({ length: scale }, (_, i) => i + 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {points.map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => onChange(point)}
            className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl border-2 transition-all duration-250 ${
              value === point
                ? "border-primary bg-primary/10 text-primary shadow-lg scale-105"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/30 hover:scale-105 active:scale-95"
            }`}
          >
            <span className="text-xl sm:text-2xl font-bold">{point}</span>
          </button>
        ))}
      </div>
      {labels && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {labels.left && <span>{labels.left}</span>}
          {value !== null && (
            <span className="font-medium">Selected: {value}</span>
          )}
          {labels.right && <span className="ml-auto">{labels.right}</span>}
        </div>
      )}
    </div>
  );
}
