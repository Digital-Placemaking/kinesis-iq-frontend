import { AlertTriangle, Megaphone, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopSignals, getWeeklyOverview } from "@/lib/councillor/api";
import {
  INDICATORS,
  WARD,
  type IndicatorDef,
  type IndicatorKey,
} from "@/lib/councillor/config";
import {
  SAMPLE_INDICATORS,
  type IndicatorView,
  type StatusTone,
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

/**
 * Week-over-week move that counts as a real trend. 0.05 mirrors the ETL's
 * TREND_THRESHOLD (kinesis-iq-etl docs/project/indicator_semantics.md), so the
 * Demand arrow agrees with the view's own trend_indicator column. Sentiment
 * keeps its tighter band because it rides a -1..1 scale, not 0..1.
 */
const TREND_THRESHOLD = 0.05;
const SENTIMENT_TREND_THRESHOLD = 0.02;

type BuiltIndicator = {
  key: IndicatorKey;
  /** Props for the headline card. */
  card: IndicatorView & { label: string };
  /** oldest → newest, week labels kept aligned with the surviving values. */
  points: { week: string; value: number }[];
};

/**
 * Bands for the [0, 1] index columns (request_intensity_index, pressure_index,
 * service_delay_index). Higher means more strain on the ward, so the tone
 * escalates with the value.
 */
function indexBand(value: number): { status: string; statusTone: StatusTone } {
  if (value < 0.25) return { status: "Low", statusTone: "good" };
  if (value < 0.5) return { status: "Moderate", statusTone: "watch" };
  if (value < 0.75) return { status: "Elevated", statusTone: "elevated" };
  return { status: "High", statusTone: "critical" };
}

/** Reads one indicator column off a row, treating anything non-numeric as absent. */
function numericColumn(
  row: IndicatorRow | undefined,
  column: IndicatorDef["column"]
): number | null {
  const value = row?.[column];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sampleFallback(def: IndicatorDef): BuiltIndicator {
  const sample = SAMPLE_INDICATORS[def.key];
  return {
    key: def.key,
    card: { ...sample, label: def.label },
    points: sample.series.map((value, i) => ({ week: `W${i + 1}`, value })),
  };
}

/**
 * Live value straight off the newest ward-week row; labeled sample only when
 * that column is null. Driven by `def.column`, so every indicator goes live the
 * moment its producer starts filling the view — no per-key special cases.
 */
function buildIndicator(def: IndicatorDef, rows: IndicatorRow[]): BuiltIndicator {
  const newest = numericColumn(rows[0], def.column);
  if (newest === null) return sampleFallback(def);

  const sample = SAMPLE_INDICATORS[def.key];
  const prev = numericColumn(rows[1], def.column);
  const change = prev === null ? null : newest - prev;
  const threshold =
    def.key === "sentiment" ? SENTIMENT_TREND_THRESHOLD : TREND_THRESHOLD;

  const direction =
    change === null || Math.abs(change) <= threshold
      ? "flat"
      : change > 0
        ? "up"
        : "down";

  const band =
    def.key === "sentiment"
      ? sentimentBand(newest)
      : indexBand(newest);

  // oldest → newest; rows whose column is null drop out with their label.
  const points = [...rows].reverse().flatMap((row) => {
    const value = numericColumn(row, def.column);
    return value === null ? [] : [{ week: weekLabel(row.time_bucket), value }];
  });

  return {
    key: def.key,
    card: {
      label: def.label,
      value: newest,
      delta:
        change === null
          ? "No prior week"
          : direction === "flat"
            ? "Stable"
            : `${change > 0 ? "+" : ""}${change.toFixed(2)} vs last week`,
      direction,
      status: band.status,
      statusTone: band.statusTone,
      directionTone:
        direction === "flat"
          ? "neutral"
          : (direction === "up") === def.higherIsBetter
            ? "good"
            : "bad",
      series: points.length ? points.map((p) => p.value) : sample.series,
      sample: false,
    },
    points: points.length
      ? points
      : sample.series.map((value, i) => ({ week: `W${i + 1}`, value })),
  };
}

function sentimentBand(value: number): { status: string; statusTone: StatusTone } {
  const tone = sentimentTone(value);
  return { status: tone.label, statusTone: TONE_BY_SENTIMENT[tone.tone] };
}

/**
 * Every card reads rows[0] as "this week". /weekly-overview already sorts
 * newest-first before slicing to 4 weeks, but the underlying view query has no
 * ORDER BY of its own — re-sorting here keeps the page correct on its own terms
 * rather than on the endpoint's current slicing behaviour.
 */
function newestFirst(rows: IndicatorRow[]): IndicatorRow[] {
  return [...rows].sort((a, b) => {
    const ta = new Date(a.time_bucket).getTime();
    const tb = new Date(b.time_bucket).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return tb - ta;
  });
}

export default async function Ward7Dashboard() {
  const [wkRes, tsRes] = await Promise.allSettled([
    getWeeklyOverview(),
    getTopSignals(),
  ]);

  const rows: IndicatorRow[] = newestFirst(
    wkRes.status === "fulfilled" ? wkRes.value.data ?? [] : []
  );
  const signals: TopSignals | null =
    tsRes.status === "fulfilled" ? tsRes.value : null;
  const apiDown = wkRes.status === "rejected" && tsRes.status === "rejected";

  const indicators = INDICATORS.map((def) => buildIndicator(def, rows));

  const trendTabs: TrendTab[] = indicators.map((ind) => ({
    key: ind.key,
    label: ind.card.label,
    sample: ind.card.sample,
    points: ind.points,
  }));

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
            <IndicatorCard key={ind.key} {...ind.card} />
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
