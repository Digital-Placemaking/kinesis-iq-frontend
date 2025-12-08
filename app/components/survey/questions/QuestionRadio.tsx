/**
 * app/components/survey/questions/QuestionRadio.tsx
 * Radio button question component.
 * Renders radio buttons for single-choice survey questions.
 */

interface QuestionRadioProps {
  value: string | null;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}

export default function QuestionRadio({
  value,
  onChange,
  options,
  required = false,
}: QuestionRadioProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {options.map((option, index) => {
        const isSelected = value === option;
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
              type="radio"
              name={`radio-${index}`}
              value={option}
              checked={isSelected}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              className="h-5 w-5 border-2 border-border text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 accent-primary flex-shrink-0"
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
