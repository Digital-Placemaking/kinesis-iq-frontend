/**
 * Labeled SAMPLE values for the system-health indicators that have no producer
 * yet (Demand / Pressure / Delay are NULL in both real and sandbox data — see
 * kinesis-iq-etl/schemas/api_views.sql). These render with a visible "Sample"
 * badge so they show the intended experience without being presented as real
 * Ward 7 figures. Sentiment is produced live, so it is NOT sampled here.
 *
 * Replace these with live values once Niloufar/Sameer ship the indicator
 * producers — the dashboard already reads live data first and only falls back to
 * SAMPLE_INDICATORS when the backing column is null.
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
