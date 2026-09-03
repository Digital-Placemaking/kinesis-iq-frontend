import { AlertTriangle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { QueryResult as QueryResultData } from "@/lib/councillor/queries/types";
import { cn } from "@/lib/utils";
import { PctBadge } from "../../components/PctBadge";
import { OverviewCard, type OverviewRow } from "../components/OverviewCard";
import { Sparkline } from "../components/Sparkline";

export interface QueryPanel {
  id: string;
  scope: string;
  result: QueryResultData;
}

export function QueryResult({ results }: { results: QueryPanel[] | null }) {
  if (!results) {
    return (
      <Card className="border-dashed bg-slate-50/60 shadow-none">
        <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Search className="size-5" />
          </span>
          <p className="text-sm font-medium text-slate-700">
            Your query results will appear here
          </p>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Select signals and filters, then run the views to generate a card
            for every compatible combination.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groups = groupPanels(results);

  return (
    <section className="space-y-3" aria-labelledby="query-results-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="query-results-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Query results
        </h2>
        <p className="text-xs text-slate-500">
          {groups.length} {groups.length === 1 ? "signal" : "signals"} ·{" "}
          {results.length} {results.length === 1 ? "view" : "views"}
        </p>
      </div>
      <div className="space-y-8">
        {groups.map((group, index) => {
          const headingId = `query-result-group-${index}`;
          return (
            <section
              key={group.title}
              className="space-y-3"
              aria-labelledby={headingId}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <h3
                  id={headingId}
                  className="text-sm font-semibold uppercase tracking-wide text-slate-700"
                >
                  {group.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {group.panels.length}{" "}
                  {group.panels.length === 1 ? "card" : "cards"}
                </p>
              </div>
              <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.panels.map((panel) => (
                  <ResultCard key={panel.id} panel={panel} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function ResultCard({ panel }: { panel: QueryPanel }) {
  const { result, scope } = panel;

  if (result.status === "unavailable") {
    const names = result.missing.map(bundleLabel).join(", ");
    return (
      <Card className="border-amber-200 bg-amber-50 shadow-none">
        <CardContent className="flex min-h-40 items-start gap-3 text-amber-800">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">{scope} is unavailable</p>
            <p className="mt-2 text-sm text-amber-700">
              This view needs {names}. Other result cards may still be
              available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.status === "empty") {
    return (
      <OverviewCard
        title={scope}
        hint={result.title}
        rows={[]}
        emptyText={result.reason}
      />
    );
  }

  const rows: OverviewRow[] = result.rows.map((row) => ({
    id: row.id,
    label: row.label,
    sub: row.sub,
    trailing:
      row.metric || row.sparkline ? (
        <div className="flex items-center gap-3">
          {row.metric?.kind === "percent" ? (
            <PctBadge value={row.metric.value} />
          ) : row.metric ? (
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                row.metric.tone === "positive"
                  ? "text-emerald-700"
                  : row.metric.tone === "negative"
                    ? "text-red-700"
                    : "text-slate-800"
              )}
            >
              {row.metric.value}
            </span>
          ) : null}
          {row.sparkline ? <Sparkline values={row.sparkline} /> : null}
        </div>
      ) : undefined,
  }));

  return (
    <div className="space-y-2">
      <OverviewCard
        title={scope}
        hint={result.hint}
        rows={rows}
      />
      {result.footnote ? (
        <p className="px-1 text-xs leading-5 text-slate-400">
          {result.footnote}
        </p>
      ) : null}
    </div>
  );
}

function groupPanels(results: QueryPanel[]) {
  return results.reduce<
    Array<{ title: string; panels: QueryPanel[] }>
  >((groups, panel) => {
    const title = panel.result.title;
    const existing = groups.find((group) => group.title === title);
    if (existing) {
      existing.panels.push(panel);
    } else {
      groups.push({ title, panels: [panel] });
    }
    return groups;
  }, []);
}

function bundleLabel(bundle: "topSignals" | "wardView" | "hotspots") {
  switch (bundle) {
    case "topSignals":
      return "Top Signals data";
    case "wardView":
      return "Ward Story data";
    case "hotspots":
      return "Hotspots data";
  }
}
