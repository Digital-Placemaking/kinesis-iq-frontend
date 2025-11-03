/**
 * Date picker question component
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
      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
    />
  );
}
