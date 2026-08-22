import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface OverviewRow {
  id: string;
  label: string;
  sub?: string;
  trailing?: ReactNode;
}

export function OverviewCard({
  title,
  hint,
  rows,
  emptyText = "No data available.",
}: {
  title: string;
  hint?: string;
  rows: OverviewRow[];
  emptyText?: string;
}) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </CardTitle>
        {hint ? <CardDescription>{hint}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-2.5">
        {rows.length ? (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {r.label}
                </p>
                {r.sub ? (
                  <p className="truncate text-xs text-slate-500">{r.sub}</p>
                ) : null}
              </div>
              {r.trailing ? (
                <div className="shrink-0">{r.trailing}</div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}
