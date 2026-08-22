/**
 * Display helpers that encode the Story Layer contract gotchas in one place:
 *  - percent fields can be the string "new" (render a badge, not a number)
 *  - `ratio` can be null (sort last)
 *  - WARD VS CITY leaks raw column names like "Is_Admin" → relabel to "Admin"
 *  - percent fields are already-percents; share fields are 0–1 fractions
 */
import type { PctOrNew } from "./types";

export function isNew(p: PctOrNew | null | undefined): p is "new" {
  return p === "new";
}

/** "+54.46%" / "-24.0%" / "new". */
export function pctLabel(p: PctOrNew | null | undefined): string {
  if (p === null || p === undefined) return "—";
  if (p === "new") return "new";
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(p % 1 === 0 ? 0 : 2)}%`;
}

export type Direction = "up" | "down" | "flat";

export function pctDirection(p: PctOrNew | null | undefined): Direction {
  if (p === "new" || p === null || p === undefined) return "up";
  if (p > 0.5) return "up";
  if (p < -0.5) return "down";
  return "flat";
}

/** Thousands-separated integer. */
export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-CA");
}

/** A 0–1 share fraction → "11.08%". */
export function sharePct(fraction: number | null | undefined): string {
  if (fraction === null || fraction === undefined) return "—";
  return `${(fraction * 100).toFixed(2)}%`;
}

/** "1.59x" or "—" when ratio is null (undefined city share). */
export function ratioLabel(ratio: number | null | undefined): string {
  if (ratio === null || ratio === undefined) return "—";
  return `${ratio.toFixed(2)}×`;
}

/**
 * Clean a category label for display. The ward-view bundle sometimes carries raw
 * column names like "Is_Admin" / "Is_Parking" — relabel to "Admin" / "Parking".
 */
export function categoryLabel(raw: string): string {
  if (!raw) return raw;
  let c = raw.replace(/^Is_/i, "");
  c = c.replace(/_/g, " ");
  return c.charAt(0).toUpperCase() + c.slice(1);
}

/** Map a -1..1 sentiment score to a label + tone. */
export function sentimentTone(score: number | null | undefined): {
  label: string;
  tone: "positive" | "neutral" | "negative";
} {
  if (score === null || score === undefined)
    return { label: "No data", tone: "neutral" };
  if (score >= 0.15) return { label: "Positive", tone: "positive" };
  if (score <= -0.15) return { label: "Negative", tone: "negative" };
  return { label: "Mixed", tone: "neutral" };
}

/** Sort WARD VS CITY rows by ratio desc, pushing null ratios to the end. */
export function byRatioDesc<T extends { ratio: number | null }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.ratio === null && b.ratio === null) return 0;
    if (a.ratio === null) return 1;
    if (b.ratio === null) return -1;
    return b.ratio - a.ratio;
  });
}
