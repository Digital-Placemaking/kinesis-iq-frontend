/**
 * app/components/survey/questions/QuestionDate.tsx
 * Date picker question component.
 * Renders a date picker input for date-type survey questions with optional min/max date constraints.
 */

"use client";

interface QuestionDateProps {
  value: string | null;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export default function QuestionDate({
  value,
  onChange,
  min,
  max,
}: QuestionDateProps) {
  return (
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      className="w-full rounded-xl border-2 border-border bg-card px-4 py-3.5 sm:py-4 text-base sm:text-lg text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/20 transition-all duration-250"
    />
  );
}
