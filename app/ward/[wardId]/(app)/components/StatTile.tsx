import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  SIGNAL_BAR_CLASS,
  STATUS_TONE_CLASS,
  type StatusTone,
} from "@/lib/councillor/sample-indicators";

/**
 * A single headline number for the drill-down headers: label on top, big
 * tabular value, optional trailing badge and a one-line footnote.
 *
 * `tone` renders the Visual Skin Reference card treatment — the 4px leading
 * signal bar plus the matching status pill — so these tiles read the same as
 * the dashboard's IndicatorCard one click away.
 */
export function StatTile({
  label,
  value,
  badge,
  foot,
  muted = false,
  tone,
  status,
}: {
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  foot?: ReactNode;
  /** Dim the value when there is no figure to show. */
  muted?: boolean;
  tone?: StatusTone;
  /** Pill text, e.g. "Elevated". Requires `tone`. */
  status?: string;
}) {
  return (
    <Card className={cn("gap-2 p-4", tone && SIGNAL_BAR_CLASS[tone])}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-semibold tabular-nums",
            muted ? "text-xl text-slate-500" : "text-2xl text-slate-900"
          )}
        >
          {value}
        </span>
        {badge ? <span className="shrink-0">{badge}</span> : null}
      </div>
      {foot ? <p className="text-xs text-slate-500">{foot}</p> : null}
      {tone && status ? (
        <span
          className={cn(
            "mt-1 inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold",
            STATUS_TONE_CLASS[tone]
          )}
        >
          {status}
        </span>
      ) : null}
    </Card>
  );
}
