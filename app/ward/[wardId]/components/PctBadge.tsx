import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNew, pctLabel } from "@/lib/councillor/format";
import type { PctOrNew } from "@/lib/councillor/types";

/**
 * Renders a percent change, honoring the contract's `"new"` special value
 * (a real count this year with no baseline) as a distinct badge, not a number.
 */
export function PctBadge({
  value,
  className,
}: {
  value: PctOrNew | null | undefined;
  className?: string;
}) {
  if (isNew(value)) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700",
          className
        )}
        title="New: a real count this year with no baseline to compare against"
      >
        <Sparkles className="size-3" />
        New
      </span>
    );
  }

  const n = typeof value === "number" ? value : null;
  const positive = (n ?? 0) >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        n === null
          ? "bg-slate-100 text-slate-500"
          : positive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700",
        className
      )}
    >
      {n !== null ? (
        positive ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
      ) : null}
      {pctLabel(value)}
    </span>
  );
}
