import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marks a value as a labeled sample (the indicator has no producer yet — the
 * backing column is NULL in real and sandbox data). Keeps the demo honest: these
 * are clearly not real Ward 7 figures.
 */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      title="Sample value — this indicator has no live data producer yet"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700",
        className
      )}
    >
      <FlaskConical className="size-2.5" />
      Sample
    </span>
  );
}
