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

export const WARD = {
  id: "07",
  name: "Humber River-Black Creek",
} as const;

/**
 * The four headline "system health" indicators shown on the dashboard.
 *
 * `column` is the v_ward_week_indicators field that backs the card.
 * `live` marks the only two that are actually produced today; the rest are NULL
 * in both real and sandbox data, so they render as labeled SAMPLE values.
 */
export type IndicatorKey = "demand" | "pressure" | "delay" | "sentiment";

export interface IndicatorDef {
  key: IndicatorKey;
  label: string;
  column: keyof import("./types").IndicatorRow;
  live: boolean;
  blurb: string;
}

export const INDICATORS: IndicatorDef[] = [
  {
    key: "demand",
    label: "Demand",
    column: "request_intensity_index",
    live: false,
    blurb: "Service-request intensity vs. the ward's own baseline.",
  },
  {
    key: "pressure",
    label: "Pressure",
    column: "pressure_index",
    live: false,
    blurb: "Composite strain across categories this week.",
  },
  {
    key: "delay",
    label: "Delay",
    column: "service_delay_index",
    live: false,
    blurb: "How far open requests run past their expected close.",
  },
  {
    key: "sentiment",
    label: "Sentiment",
    column: "sentiment_score_avg",
    live: true,
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
