/**
 * Yes/No boolean question component
 */
"use client";

interface QuestionYesNoProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export default function QuestionYesNo({ value, onChange }: QuestionYesNoProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex flex-1 items-center justify-center rounded-lg border-2 px-6 py-4 transition-all ${
          value === true
            ? "border-green-500 bg-green-50 text-green-600 dark:border-green-400 dark:bg-green-900/20 dark:text-green-400"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-green-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-green-700 dark:hover:bg-zinc-800"
        }`}
      >
        <span className="text-base font-semibold">Yes</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex flex-1 items-center justify-center rounded-lg border-2 px-6 py-4 transition-all ${
          value === false
            ? "border-red-500 bg-red-50 text-red-600 dark:border-red-400 dark:bg-red-900/20 dark:text-red-400"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-red-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-red-700 dark:hover:bg-zinc-800"
        }`}
      >
        <span className="text-base font-semibold">No</span>
      </button>
    </div>
  );
}
