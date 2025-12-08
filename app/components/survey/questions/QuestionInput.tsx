/**
 * app/components/survey/questions/QuestionInput.tsx
 * Text input question component.
 * Renders a text input or textarea field for open-text survey questions.
 */

"use client";

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
}

export default function QuestionInput({
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
}: QuestionInputProps) {
  const baseClasses =
    "w-full rounded-xl border-2 border-border bg-card px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/20 focus:outline-none transition-all duration-250 resize-none";

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Type your thoughts here..."}
        required={required}
        rows={6}
        className={baseClasses}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={baseClasses}
    />
  );
}
