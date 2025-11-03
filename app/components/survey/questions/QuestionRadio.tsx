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
    <div className="space-y-3">
      {options.map((option, index) => (
        <label
          key={index}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:bg-zinc-800"
        >
          <input
            type="radio"
            name={`radio-${index}`}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="h-4 w-4 border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
          <span className="text-sm text-black dark:text-zinc-50">{option}</span>
        </label>
      ))}
    </div>
  );
}
