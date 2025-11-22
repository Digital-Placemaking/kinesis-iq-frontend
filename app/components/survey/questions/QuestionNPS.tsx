/**
 * app/components/survey/questions/QuestionNPS.tsx
 * Net Promoter Score (NPS) question component.
 * Renders NPS question with 0-10 scale using emoji icons for ratings.
 */

"use client";

interface QuestionNPSProps {
  value: number | null;
  onChange: (value: number) => void;
}

// Get emoji icon for NPS score (0-10)
function getNPSIcon(score: number): string {
  if (score <= 2) return "😞"; // Very negative
  if (score <= 4) return "😐"; // Negative
  if (score <= 6) return "😑"; // Neutral
  if (score <= 8) return "🙂"; // Positive
  return "😊"; // Very positive (9-10)
}

export default function QuestionNPS({ value, onChange }: QuestionNPSProps) {
  const scale = Array.from({ length: 11 }, (_, i) => i); // 0-10

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {scale.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`group relative flex h-12 w-12 flex-col items-center justify-center rounded-lg border-2 transition-all sm:h-14 sm:w-14 ${
              value === num
                ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-900/20"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-700 dark:hover:bg-zinc-800"
            }`}
            title={`${num} - ${
              num <= 2
                ? "Not at all likely"
                : num <= 6
                ? "Somewhat likely"
                : "Extremely likely"
            }`}
          >
            <span className="text-xl sm:text-2xl">{getNPSIcon(num)}</span>
            <span
              className={`mt-0.5 text-[10px] font-semibold sm:text-xs ${
                value === num
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {num}
            </span>
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
