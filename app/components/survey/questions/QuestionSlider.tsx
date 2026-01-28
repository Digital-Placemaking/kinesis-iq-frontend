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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4 sm:gap-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 accent-primary cursor-pointer"
        />
        <div className="flex min-w-20 items-center justify-center rounded-xl border-2 border-border bg-card px-5 py-3">
          <span className="text-lg sm:text-xl font-bold text-foreground">
            {currentValue}
          </span>
        </div>
      </div>
      {labels && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {labels.min && <span>{labels.min}</span>}
          {labels.max && <span>{labels.max}</span>}
        </div>
      )}
    </div>
  );
}
