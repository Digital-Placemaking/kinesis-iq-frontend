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
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1.5">
        {points.map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => onChange(point)}
            className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
              value === point
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/30 active:scale-95"
            }`}
          >
            <span className="text-base sm:text-lg font-bold">{point}</span>
          </button>
        ))}
      </div>
      {labels && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
          {labels.left && <span>{labels.left}</span>}
          {labels.right && <span>{labels.right}</span>}
        </div>
      )}
    </div>
  );
}
