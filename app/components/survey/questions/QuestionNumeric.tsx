/**
 * app/components/survey/questions/QuestionNumeric.tsx
 * Numeric input question component.
 * Renders a numeric input field for numeric-only survey responses with optional min/max constraints.
 */

"use client";

interface QuestionNumericProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}

export default function QuestionNumeric({
  value,
  onChange,
  min,
  max,
  placeholder = "Enter a number",
}: QuestionNumericProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(null);
      return;
    }

    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      // Apply min/max constraints if provided
      let finalValue = num;
      if (min !== undefined && num < min) finalValue = min;
      if (max !== undefined && num > max) finalValue = max;
      onChange(finalValue);
    }
  };

  return (
    <input
      type="number"
      value={value === null ? "" : value}
      onChange={handleChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step="any"
      className="w-full rounded-xl border-2 border-border bg-card px-4 py-3.5 sm:py-4 text-base sm:text-lg text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/20 transition-all duration-250"
    />
  );
}
