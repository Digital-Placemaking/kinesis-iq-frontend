import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SampleBadge } from "../../components/SampleBadge";
import {
  STATUS_TONE_CLASS,
  type IndicatorView,
} from "@/lib/councillor/sample-indicators";

const DIR_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  flat: ArrowRight,
} as const;

export interface IndicatorCardProps extends IndicatorView {
  label: string;
}

export function IndicatorCard({
  label,
  value,
  delta,
  direction,
  status,
  statusTone,
  sample,
}: IndicatorCardProps) {
  const Dir = DIR_ICON[direction];
  return (
    <Card className="gap-0 border-l-4 border-l-transparent p-4 py-4 data-[tone=critical]:border-l-red-400 data-[tone=elevated]:border-l-amber-400 data-[tone=good]:border-l-emerald-400">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {sample ? <SampleBadge /> : null}
      </div>
      <div className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
        {value.toFixed(2)}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
        <Dir
          className={cn(
            "size-3.5",
            direction === "up" && "text-emerald-600",
            direction === "down" && "text-red-600",
            direction === "flat" && "text-slate-400"
          )}
        />
        <span>{delta}</span>
      </div>
      <span
        className={cn(
          "mt-3 inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold",
          STATUS_TONE_CLASS[statusTone]
        )}
      >
        {status}
      </span>
    </Card>
  );
}
