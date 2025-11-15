// QuestionLikert
// Renders Likert scale questions supporting 5-point and 7-point scales with optional labels.
// Used in: app/components/survey/QuestionCard.tsx

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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {points.map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => onChange(point)}
            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${
              value === point
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-700 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-lg font-semibold">{point}</span>
          </button>
        ))}
      </div>
      {labels && (
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
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
