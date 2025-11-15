// QuestionNumeric
// Renders a numeric input field for numeric-only survey responses with optional min/max constraints.
// Used in: app/components/survey/QuestionCard.tsx

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
      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
    />
  );
}
