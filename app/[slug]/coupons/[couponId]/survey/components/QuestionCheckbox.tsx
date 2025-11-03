interface QuestionCheckboxProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  required?: boolean;
}

export default function QuestionCheckbox({
  values,
  onChange,
  options,
  required = false,
}: QuestionCheckboxProps) {
  const handleToggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <label
          key={index}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:bg-zinc-800"
        >
          <input
            type="checkbox"
            checked={values.includes(option)}
            onChange={() => handleToggle(option)}
            required={required && values.length === 0}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
          <span className="text-sm text-black dark:text-zinc-50">{option}</span>
        </label>
      ))}
    </div>
  );
}
