/**
 * app/components/survey/questions/QuestionCheckbox.tsx
 * Checkbox question component.
 * Renders checkboxes for multiple-choice questions allowing multiple selections.
 */

"use client";

interface QuestionCheckboxProps {
  value: string[] | null;
  onChange: (value: string[]) => void;
  options: string[];
}

export default function QuestionCheckbox({
  value,
  onChange,
  options,
}: QuestionCheckboxProps) {
  const selectedValues = value || [];

  const handleToggle = (option: string) => {
    if (selectedValues.includes(option)) {
      // Remove option
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      // Add option
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option);
        return (
          <label
            key={index}
            className={`group flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 sm:p-5 text-left transition-all duration-250 ${
              isSelected
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(option)}
              className="h-5 w-5 rounded border-2 border-border text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 accent-primary flex-shrink-0"
            />
            <span
              className={`text-base sm:text-lg font-semibold transition-colors flex-1 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}
