/**
 * Static config + constants for the councillor demo.
 *
 * The backend (Hansen's FastAPI gateway) base URL is read from
 * COUNCILLOR_API_URL (server) so it can point at localhost in dev and the hosted
 * service in prod. It is a server-only env var (the token never reaches the
 * browser — all FastAPI calls run in server components / actions).
 */

export const COUNCILLOR_API_URL =
  process.env.COUNCILLOR_API_URL ?? "http://127.0.0.1:8000";

/** httpOnly cookies set on login. */
export const TOKEN_COOKIE = "kiq_token";
export const SESSION_COOKIE = "kiq_session";
/** Must match path used in jar.set / jar.delete. */
export const COOKIE_PATH = "/";

export const WARD = {
  id: "07",
  name: "Humber River-Black Creek",
} as const;

/**
 * The four headline "system health" indicators shown on the dashboard.
 *
 * `column` is the v_ward_week_indicators field that backs the card — the
 * dashboard reads it straight off the newest ward-week row and only falls back
 * to a labeled SAMPLE when the column is null. All four now have producers
 * (kinesis-iq-etl/etl/indicator_producers.py); the three *_index columns are
 * [0, 1] and sentiment_score_avg is [-1, 1].
 *
 * `higherIsBetter` drives the up/down arrow colour: a rising Pressure is bad
 * news, a rising Sentiment is good news.
 */
export type IndicatorKey = "demand" | "pressure" | "delay" | "sentiment";

export interface IndicatorDef {
  key: IndicatorKey;
  label: string;
  column: keyof import("./types").IndicatorRow;
  higherIsBetter: boolean;
  blurb: string;
}

export const INDICATORS: IndicatorDef[] = [
  {
    key: "demand",
    label: "Demand",
    column: "request_intensity_index",
    higherIsBetter: false,
    blurb: "Request volume normalised against the intensity cap (500/week).",
  },
  {
    key: "pressure",
    label: "Pressure",
    column: "pressure_index",
    higherIsBetter: false,
    blurb: "Composite of request intensity and demand concentration.",
  },
  {
    key: "delay",
    label: "Delay",
    column: "service_delay_index",
    higherIsBetter: false,
    blurb: "Share of this week's requests still open or in progress.",
  },
  {
    key: "sentiment",
    label: "Sentiment",
    column: "sentiment_score_avg",
    higherIsBetter: true,
    blurb: "Average resident sentiment across feedback this week.",
  },
];

/** Ordered nav across the four demo screens (Figma "Next →" flow). */
export const WARD7_SCREENS = [
  { href: "/ward7", label: "Dashboard" },
  { href: "/ward7/signals", label: "Signal Overview" },
  { href: "/ward7/story", label: "Ward Story" },
  { href: "/ward7/hotspots", label: "Hotspots" },
] as const;
