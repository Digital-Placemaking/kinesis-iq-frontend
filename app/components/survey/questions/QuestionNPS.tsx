/**
 * Net Promoter Score (NPS) question component
 * 0-10 scale rating question
 */
"use client";

interface QuestionNPSProps {
  value: number | null;
  onChange: (value: number) => void;
}

export default function QuestionNPS({ value, onChange }: QuestionNPSProps) {
  const scale = Array.from({ length: 11 }, (_, i) => i); // 0-10

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {scale.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all ${
              value === num
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-700 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-sm font-semibold">{num}</span>
          </button>
        ))}
      </div>
      {value !== null && (
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>Not at all likely</span>
          <span className="font-medium">Selected: {value}</span>
          <span>Extremely likely</span>
        </div>
      )}
    </div>
  );
}
