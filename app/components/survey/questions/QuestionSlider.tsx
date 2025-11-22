/**
 * app/components/survey/questions/QuestionSlider.tsx
 * Slider question component.
 * Renders a range slider for range-based numeric survey input with customizable min/max/step values.
 */

"use client";

interface QuestionSliderProps {
  value: number | null;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  labels?: {
    min?: string;
    max?: string;
  };
}

export default function QuestionSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  labels,
}: QuestionSliderProps) {
  const currentValue = value ?? min;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <div className="flex min-w-[4rem] items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-base font-semibold text-black dark:text-zinc-50">
            {currentValue}
          </span>
        </div>
      </div>
      {labels && (
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          {labels.min && <span>{labels.min}</span>}
          {labels.max && <span>{labels.max}</span>}
        </div>
      )}
    </div>
  );
}
