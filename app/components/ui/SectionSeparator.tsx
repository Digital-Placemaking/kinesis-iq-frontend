/**
 * Section separator component
 * Displays a horizontal line with centered text
 */
interface SectionSeparatorProps {
  text: string;
  className?: string;
}

export default function SectionSeparator({
  text,
  className = "",
}: SectionSeparatorProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-gradient-to-b from-zinc-50 to-white px-2 text-zinc-500 dark:from-black dark:to-zinc-950 dark:text-zinc-400">
          {text}
        </span>
      </div>
    </div>
  );
}
