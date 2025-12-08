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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {scale.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`group relative flex h-14 w-14 sm:h-16 sm:w-16 flex-col items-center justify-center rounded-xl border-2 transition-all duration-250 ${
              value === num
                ? "border-primary bg-primary/10 shadow-lg scale-105"
                : "border-border bg-card hover:border-primary/50 hover:bg-muted/30 hover:scale-105 active:scale-95"
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
                value === num ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {num}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
