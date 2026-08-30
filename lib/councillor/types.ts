/**
 * Types for the KinesisIQ councillor demo (Ward 7).
 *
 * These mirror the backend contracts exactly:
 *  - Indicator rows: `v_ward_week_indicators` (kinesis-iq-etl/schemas/api_views.sql)
 *  - Story Layer:    kinesis-iq-backend/data/*_contract.md
 *
 * IMPORTANT: every story percent field can be the literal string "new" (a real
 * count this year with no baseline to compare to). `ratio` can be null. These are
 * encoded in the types below so the UI is forced to handle them.
 */

/** A percent field that may be undefined-as-"new" instead of a number. */
export type PctOrNew = number | "new";

export const FIXED_CATEGORIES = [
  "Waste",
  "Roads",
  "Property",
  "Animal",
  "Water/Sewer",
  "Trees",
  "Noise",
  "Other",
  "Admin",
  "Parking",
] as const;

export const MICRO_AREAS = ["M3N", "M9M", "M3J", "M9L", "M3L"] as const;

// ---------------------------------------------------------------------------
// Indicators — v_ward_week_indicators (one row per ward-week)
// Only request_count_raw + sentiment_score_avg are produced today; every *_index,
// trend_indicator, anomaly_flag, etc. is a NULL stub (real AND sandbox).
// ---------------------------------------------------------------------------

export interface IndicatorRow {
  ward_id: string;
  ward_name: string;
  time_bucket: string; // ISO date (week start)
  period_type: string; // "week"
  request_count_raw: number | null;
  sentiment_score_avg: number | null;
  // Stub columns — NULL until producers ship.
  request_intensity_index: number | null;
  pressure_index: number | null;
  service_delay_index: number | null;
  category_volatility_index: number | null;
  sentiment_label_dominant: string | null;
  behavioural_cluster: string | null;
  anomaly_flag: boolean | null;
  trend_indicator: string | null;
}

export interface WeeklyOverviewResponse {
  ward_id: string;
  data: IndicatorRow[];
}

export interface IndicatorResponse {
  ward_id: string;
  indicator: string;
  data: IndicatorRow[];
}

// ---------------------------------------------------------------------------
// Story Layer — shared meta
// ---------------------------------------------------------------------------

export interface StoryMeta {
  ward: string;
  source: string;
  recent_year: number;
  baseline_years: number[];
  years_covered: number[];
  ward7_requests_recent_year: number;
  rows_dropped_no_date: number;
  _notes?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// /story/top-signals — top5_signals.json
// ---------------------------------------------------------------------------

export interface RisingCategory {
  category: string;
  recent: number;
  baseline_avg: number;
  pct_change: PctOrNew;
}

export interface DriftingLocation {
  fsa: string;
  slope: number;
  series: number[];
}

export interface RisingFasterThanCity {
  category: string;
  ward7_growth_pct: number;
  city_growth_pct: number;
  delta_pct: number;
}

export interface RepeatedComplaint {
  fsa: string;
  type: string;
  count: number;
}

export interface EarlyWarning {
  category: string;
  recent: number;
  prior: number;
  pct_change: PctOrNew;
  z_score: number;
  flag: boolean;
}

export interface TopSignals {
  rising_categories: RisingCategory[];
  drifting_locations: DriftingLocation[];
  rising_faster_than_city: RisingFasterThanCity[];
  repeated_complaints: RepeatedComplaint[];
  early_warning: EarlyWarning[];
  meta: StoryMeta;
}

// ---------------------------------------------------------------------------
// /story/hotspots — hotspots_micro_areas.json
// ---------------------------------------------------------------------------

export interface HotspotCategory {
  category: string;
  count: number;
}

export interface Hotspot {
  fsa: string;
  total: number;
  growth_pct: PctOrNew;
  sparkline: number[];
  categories: HotspotCategory[];
}

export interface HotspotsBundle {
  hotspots: Hotspot[];
  recent_months: number;
  recent_year: number;
  meta: StoryMeta;
}

// ---------------------------------------------------------------------------
// /story/ward-view — ward7_story_view.json (8 sections + meta)
// ---------------------------------------------------------------------------

export interface WardViewRising {
  category: string;
  recent: number;
  baseline_avg: number;
  pct_change: PctOrNew;
}

export interface WardViewDrifting {
  category: string;
  slope: number;
}

export interface WardVsCity {
  category: string;
  ward7_share: number;
  city_share: number;
  ratio: number | null;
}

export interface WardStoryView {
  RISING: WardViewRising[];
  FALLING: WardViewRising[];
  DRIFTING: WardViewDrifting[];
  "TOP DRIFTING LOCATIONS": DriftingLocation[];
  "TOP HOTSPOTS": Hotspot[];
  "WARD VS CITY": WardVsCity[];
  "REPEATED COMPLAINTS": RepeatedComplaint[];
  "EARLY WARNING": EarlyWarning[];
  meta: StoryMeta;
}

// ---------------------------------------------------------------------------
// Auth / session
// ---------------------------------------------------------------------------

export type KinesisRole =
  | "councillor"
  | "staff"
  | "analyst"
  | "internal"
  | "demo_observer";

export interface CouncillorSession {
  email: string;
  role: KinesisRole;
  assigned_ward: string | null;
  dataset_scope: "real" | "sandbox";
}

export interface LoginResult {
  access_token: string;
  token_type: string;
  expires_at: number;
  user: { id: string; email: string };
  profile: {
    role: KinesisRole;
    assigned_ward: string | null;
    dataset_scope: "real" | "sandbox";
  };
}
