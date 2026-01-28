/**
 * app/components/survey/questions/QuestionTime.tsx
 * Time picker question component.
 * Renders a time picker input for time-type survey questions with optional min/max time constraints.
 */

"use client";

interface QuestionTimeProps {
  value: string | null;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export default function QuestionTime({
  value,
  onChange,
  min,
  max,
}: QuestionTimeProps) {
  return (
    <input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      className="w-full rounded-xl border-2 border-border bg-card px-4 py-3.5 sm:py-4 text-base sm:text-lg text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/20 transition-all duration-250"
    />
  );
}
