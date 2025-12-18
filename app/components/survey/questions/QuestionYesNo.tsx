/**
 * app/components/survey/questions/QuestionYesNo.tsx
 * Yes/No question component.
 * Renders Yes/No buttons for boolean survey questions.
 */

"use client";

interface QuestionYesNoProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export default function QuestionYesNo({ value, onChange }: QuestionYesNoProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex flex-1 items-center justify-center rounded-lg border-2 py-4 transition-all duration-200 ${
          value === true
            ? "border-primary bg-primary/10 text-primary shadow-md"
            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/30 active:scale-95"
        }`}
      >
        <span className="text-base sm:text-lg font-bold">Yes</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex flex-1 items-center justify-center rounded-lg border-2 py-4 transition-all duration-200 ${
          value === false
            ? "border-destructive bg-destructive/10 text-destructive shadow-md"
            : "border-border bg-card text-foreground hover:border-destructive/50 hover:bg-muted/30 active:scale-95"
        }`}
      >
        <span className="text-base sm:text-lg font-bold">No</span>
      </button>
    </div>
  );
}
