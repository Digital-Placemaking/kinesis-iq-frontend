import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  SIGNAL_BAR_CLASS,
  type StatusTone,
} from "@/lib/councillor/sample-indicators";

export interface ShareBarRow {
  id: string;
  label: string;
  sub?: string;
  /** Absolute value, rendered as the trailing number when `trailing` is unset. */
  value: number;
  /** 0–1. Bar width is this relative to the largest row. */
  share: number;
  href?: string;
  trailing?: ReactNode;
}

/**
 * Ranked breakdown tile: a proportional bar per row so the mix is readable at a
 * glance. Bars are scaled to the largest row, not to 1, because a top category
 * rarely exceeds ~35% of an area and full-scale bars would all look empty.
 */
export function ShareBars({
  title,
  hint,
  rows,
  emptyText = "No breakdown available.",
  formatValue = (n: number) => n.toLocaleString("en-CA"),
  tone,
}: {
  title: string;
  hint?: string;
  rows: ShareBarRow[];
  emptyText?: string;
  formatValue?: (n: number) => string;
  tone?: StatusTone;
}) {
  const max = rows.reduce((m, r) => Math.max(m, r.share), 0) || 1;

  return (
    <Card className={cn("gap-3", tone && SIGNAL_BAR_CLASS[tone])}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </CardTitle>
        {hint ? <CardDescription>{hint}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length ? (
          rows.map((r) => {
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-slate-800">
                    {r.label}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-800">
                    {r.trailing ?? formatValue(r.value)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-800"
                    style={{ width: `${Math.max((r.share / max) * 100, 2)}%` }}
                  />
                </div>
                {r.sub ? (
                  <p className="mt-1 truncate text-xs text-slate-500">{r.sub}</p>
                ) : null}
              </>
            );
            return r.href ? (
              <Link
                key={r.id}
                href={r.href}
                className="-mx-2 block rounded-md px-2 py-1 transition-colors hover:bg-slate-50"
              >
                {body}
              </Link>
            ) : (
              <div key={r.id}>{body}</div>
            );
          })
        ) : (
          <p className="text-sm text-slate-400">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}
