/**
 * Last-resort placeholder values for the system-health indicators.
 *
 * All four indicators are now produced by the ETL (see
 * kinesis-iq-etl/schemas/api_views.sql → v_ward_week_indicators), and the
 * dashboard reads them live off the newest ward-week row. These fixtures are
 * only used when the backing column comes back null for that row — a ward-week
 * with no sentiment measures, or a week the producers haven't filled yet. When
 * they are used the card carries a visible "Sample" badge, so the demo never
 * presents them as real Ward 7 figures.
 */
import type { IndicatorKey } from "./config";

export type StatusTone = "good" | "watch" | "elevated" | "critical";

export interface IndicatorView {
  /** 0–1 (or -1..1 for sentiment) normalized value. */
  value: number;
  /** Short delta caption, e.g. "+4% vs last week". */
  delta: string;
  direction: "up" | "down" | "flat";
  /** Band label, e.g. "Healthy". */
  status: string;
  statusTone: StatusTone;
  /** 4-week mini series for the trend view (oldest → newest). */
  series: number[];
  /** True when this is a labeled sample rather than produced data. */
  sample: boolean;
  /**
   * Whether the week-over-week move is good or bad news for the ward, used to
   * colour the arrow. Omitted on the fixtures below, where the card falls back
   * to treating "up" as good.
   */
  directionTone?: "good" | "bad" | "neutral";
}

export const SAMPLE_INDICATORS: Record<IndicatorKey, IndicatorView> = {
  demand: {
    value: 0.68,
    delta: "+4% vs last week",
    direction: "up",
    status: "Healthy",
    statusTone: "good",
    series: [0.61, 0.63, 0.66, 0.68],
    sample: true,
  },
  pressure: {
    value: 0.74,
    delta: "Rising",
    direction: "up",
    status: "Elevated",
    statusTone: "elevated",
    series: [0.58, 0.62, 0.69, 0.74],
    sample: true,
  },
  delay: {
    value: 0.51,
    delta: "Stable",
    direction: "flat",
    status: "Normal",
    statusTone: "watch",
    series: [0.49, 0.5, 0.52, 0.51],
    sample: true,
  },
  sentiment: {
    value: -0.42,
    delta: "Negative",
    direction: "down",
    status: "Critical",
    statusTone: "critical",
    series: [-0.18, -0.25, -0.36, -0.42],
    sample: true,
  },
};

export const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  watch: "bg-slate-50 text-slate-600 border-slate-200",
  elevated: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};
