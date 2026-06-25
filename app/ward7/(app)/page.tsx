import { AlertTriangle, Megaphone, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopSignals, getWeeklyOverview } from "@/lib/councillor/api";
import { INDICATORS, WARD } from "@/lib/councillor/config";
import {
  SAMPLE_INDICATORS,
  type IndicatorView,
} from "@/lib/councillor/sample-indicators";
import {
  categoryLabel,
  formatCount,
  pctLabel,
  sentimentTone,
} from "@/lib/councillor/format";
import type { IndicatorRow, TopSignals } from "@/lib/councillor/types";
import { IndicatorCard } from "./components/IndicatorCard";
import { TrendChart, type TrendTab } from "./components/TrendChart";
import { PctBadge } from "../components/PctBadge";
import { ApiErrorBanner } from "../components/StateBanner";

export const metadata = { title: "Ward 7 Dashboard · KinesisIQ" };

function weekLabel(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

const TONE_BY_SENTIMENT = {
  positive: "good",
  neutral: "watch",
  negative: "critical",
} as const;

/** Live value where the column is actually produced; labeled sample otherwise. */
function buildIndicator(
  key: (typeof INDICATORS)[number]["key"],
  label: string,
  rows: IndicatorRow[]
): IndicatorView & { label: string } {
  const sample = SAMPLE_INDICATORS[key];
  if (key === "sentiment") {
    const newest = rows[0]?.sentiment_score_avg;
    if (typeof newest === "number") {
      const tone = sentimentTone(newest);
      const series = [...rows]
        .reverse()
        .map((r) => r.sentiment_score_avg)
        .filter((v): v is number => typeof v === "number");
      const prev = rows[1]?.sentiment_score_avg;
      const dir =
        typeof prev === "number"
          ? newest > prev + 0.02
            ? "up"
            : newest < prev - 0.02
              ? "down"
              : "flat"
          : "flat";
      return {
        label,
        value: newest,
        delta: tone.label,
        direction: dir,
        status: tone.label,
        statusTone: TONE_BY_SENTIMENT[tone.tone],
        series: series.length ? series : sample.series,
        sample: false,
      };
    }
  }
  return { label, ...sample };
}

export default async function Ward7Dashboard() {
  const [wkRes, tsRes] = await Promise.allSettled([
    getWeeklyOverview(),
    getTopSignals(),
  ]);

  const rows: IndicatorRow[] =
    wkRes.status === "fulfilled" ? wkRes.value.data ?? [] : [];
  const signals: TopSignals | null =
    tsRes.status === "fulfilled" ? tsRes.value : null;
  const apiDown = wkRes.status === "rejected" && tsRes.status === "rejected";

  const indicators = INDICATORS.map((d) =>
    buildIndicator(d.key, d.label, rows)
  );

  const trendTabs: TrendTab[] = [
    {
      key: "pressure",
      label: "Pressure",
      sample: true,
      points: SAMPLE_INDICATORS.pressure.series.map((value, i) => ({
        week: `W${i + 1}`,
        value,
      })),
    },
    {
      key: "delay",
      label: "Delay",
      sample: true,
      points: SAMPLE_INDICATORS.delay.series.map((value, i) => ({
        week: `W${i + 1}`,
        value,
      })),
    },
    {
      key: "sentiment",
      label: "Sentiment",
      sample: indicators[3].sample,
      points: indicators[3].series.map((value, i) => ({
        week: rows.length ? weekLabel(rows[rows.length - 1 - i]?.time_bucket) : `W${i + 1}`,
        value,
      })),
    },
  ];

  const keyIssues = signals?.rising_categories.slice(0, 3) ?? [];
  const alerts = signals?.early_warning.slice(0, 3) ?? [];
  const topRepeat = signals?.repeated_complaints[0];
  const thisWeekCount = rows[0]?.request_count_raw ?? null;

  const narrative = signals
    ? buildNarrative(signals)
    : null;

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Ward {WARD.id} Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            {WARD.name}
            {signals ? ` · Data year ${signals.meta.recent_year}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-600">
            Ward {WARD.id}
          </span>
          {thisWeekCount !== null ? (
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
              {formatCount(thisWeekCount)} requests · latest week
            </span>
          ) : null}
        </div>
      </div>

      {apiDown ? <ApiErrorBanner /> : null}

      {/* Current System Health */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Current System Health
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {indicators.map((ind) => (
            <IndicatorCard key={ind.label} {...ind} />
          ))}
        </div>
      </section>

      {/* Key issues + alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Key Issues Impacting Ward {WARD.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {keyIssues.length ? (
              keyIssues.map((c) => (
                <div
                  key={c.category}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {categoryLabel(c.category)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCount(c.recent)} this year vs{" "}
                      {formatCount(Math.round(c.baseline_avg))} baseline
                    </p>
                  </div>
                  <PctBadge value={c.pct_change} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Live data unavailable.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <AlertTriangle className="size-4" />
              Priority Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length ? (
              alerts.map((a) => (
                <div
                  key={a.category}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {categoryLabel(a.category)} — early warning
                    </p>
                    <p className="text-xs text-slate-500">
                      z-score {a.z_score.toFixed(2)} · {formatCount(a.recent)} vs{" "}
                      {formatCount(a.prior)} prior year
                    </p>
                  </div>
                  <PctBadge value={a.pct_change} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No early-warning flags{signals ? " this period." : " (live data unavailable)."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trends + summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart tabs={trendTabs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Week in Ward {WARD.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {narrative ? (
              <p className="text-sm leading-relaxed text-slate-600">{narrative}</p>
            ) : (
              <p className="text-sm text-slate-400">
                Summary unavailable — live story data didn’t load.
              </p>
            )}
            {topRepeat ? (
              <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                Most repeated complaint:{" "}
                <span className="font-medium text-slate-700">
                  {topRepeat.type}
                </span>{" "}
                in {topRepeat.fsa} ({formatCount(topRepeat.count)} reports)
              </div>
            ) : null}
            <p className="text-[11px] text-slate-400">
              Auto-generated from live Story Layer signals.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active polls — not yet served by the API (polling-system pending) */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Active Polls &amp; Surveys</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              Coming soon
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-400"
          >
            <Megaphone className="size-4" /> Create Poll
          </button>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-400"
          >
            <Upload className="size-4" /> Import Past Survey (CSV)
          </button>
          <p className="text-xs text-slate-400">
            Live polling &amp; CSV import land with the polling-system backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function buildNarrative(s: TopSignals): string {
  const rise = s.rising_categories[0];
  const warn = s.early_warning[0];
  const parts: string[] = [];
  if (rise) {
    parts.push(
      `${categoryLabel(rise.category)} requests are ${pctLabel(
        rise.pct_change
      )} versus the ward's historical baseline`
    );
  }
  if (warn) {
    parts.push(
      `${categoryLabel(warn.category)} has been flagged as an early warning (${pctLabel(
        warn.pct_change
      )} vs the prior year)`
    );
  }
  if (!parts.length) return "No notable movements in this week's signals.";
  return `This week, ${parts.join(", and ")}.`;
}
