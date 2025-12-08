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
    <div className="flex items-center gap-4 sm:gap-6">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex flex-1 items-center justify-center rounded-xl border-2 px-6 py-5 sm:py-6 transition-all duration-250 ${
          value === true
            ? "border-primary bg-primary/10 text-primary shadow-lg scale-105"
            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/30 hover:scale-105 active:scale-95"
        }`}
      >
        <span className="text-lg sm:text-xl font-bold">Yes</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex flex-1 items-center justify-center rounded-xl border-2 px-6 py-5 sm:py-6 transition-all duration-250 ${
          value === false
            ? "border-destructive bg-destructive/10 text-destructive shadow-lg scale-105"
            : "border-border bg-card text-foreground hover:border-destructive/50 hover:bg-muted/30 hover:scale-105 active:scale-95"
        }`}
      >
        <span className="text-lg sm:text-xl font-bold">No</span>
      </button>
    </div>
  );
}
