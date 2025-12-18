/**
 * app/components/survey/questions/QuestionNPS.tsx
 * Net Promoter Score (NPS) question component.
 * Renders NPS question with 0-10 scale with color-coded feedback.
 * Colors: Red (0-4), Orange (5), Yellow (6-7), Green (8-10)
 */

"use client";

interface QuestionNPSProps {
  value: number | null;
  onChange: (value: number) => void;
}

// Color coding based on score
function getScoreColor(score: number): { border: string; bg: string; text: string } {
  if (score <= 4) return { border: "border-red-500", bg: "bg-red-500/20", text: "text-red-400" };
  if (score === 5) return { border: "border-orange-500", bg: "bg-orange-500/20", text: "text-orange-400" };
  if (score <= 7) return { border: "border-yellow-500", bg: "bg-yellow-500/20", text: "text-yellow-400" };
  return { border: "border-green-500", bg: "bg-green-500/20", text: "text-green-400" };
}

export default function QuestionNPS({ value, onChange }: QuestionNPSProps) {
  const selectedColor = value !== null ? getScoreColor(value) : null;
  
  // Get label for selected value
  const getLabel = (score: number): string => {
    if (score <= 4) return "Not likely";
    if (score === 5) return "Neutral";
    if (score <= 7) return "Somewhat likely";
    return "Very likely";
  };

  return (
    <div className="space-y-4">
      {/* Row 1: 0-5 */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((num) => {
          const isSelected = value === num;
          const colors = getScoreColor(num);
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 font-bold text-base transition-all duration-200 ${
                isSelected
                  ? `${colors.border} ${colors.bg} ${colors.text} shadow-lg scale-110`
                  : "border-border bg-card text-foreground hover:border-muted-foreground/50 hover:bg-muted/30 active:scale-95"
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
      {/* Row 2: 6-10 */}
      <div className="flex justify-center gap-2">
        {[6, 7, 8, 9, 10].map((num) => {
          const isSelected = value === num;
          const colors = getScoreColor(num);
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 font-bold text-base transition-all duration-200 ${
                isSelected
                  ? `${colors.border} ${colors.bg} ${colors.text} shadow-lg scale-110`
                  : "border-border bg-card text-foreground hover:border-muted-foreground/50 hover:bg-muted/30 active:scale-95"
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
      {/* Selected feedback with label */}
      <div className="text-center min-h-[2.5rem] flex items-center justify-center">
        {value !== null && selectedColor ? (
          <p className={`text-sm font-semibold ${selectedColor.text}`}>
            {value}/10 — {getLabel(value)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select a number from 0 (not likely) to 10 (very likely)
          </p>
        )}
      </div>
    </div>
  );
}
