import type {
  HotspotsBundle,
  PctOrNew,
  TopSignals,
  WardStoryView,
} from "../types";

export type QueryKey =
  | "rising_categories"
  | "drifting_locations"
  | "hotspots"
  | "repeated_complaints"
  | "early_warning"
  | "micro_area_trends"
  | "category_baselines"
  | "ward_vs_city";

export type FilterKind = "fsa" | "category";

export interface QueryFilters {
  fsa?: string;
  category?: string;
}

/** Each endpoint may fail independently, so unavailable bundles are explicit. */
export interface QueryBundles {
  topSignals: TopSignals | null;
  wardView: WardStoryView | null;
  hotspots: HotspotsBundle | null;
}

export type QueryBundleKey = keyof QueryBundles;

/** Serializable display metadata; domain resolvers never create JSX. */
export type QueryMetric =
  | { kind: "percent"; value: PctOrNew | null }
  | {
      kind: "text";
      value: string;
      tone?: "positive" | "negative" | "neutral";
    };

export interface QueryRow {
  id: string;
  label: string;
  sub?: string;
  metric?: QueryMetric;
  sparkline?: number[];
}

export type QueryResult =
  | {
      status: "ok";
      title: string;
      hint?: string;
      rows: QueryRow[];
      footnote?: string;
    }
  | { status: "empty"; title: string; reason: string }
  | { status: "unavailable"; title: string; missing: QueryBundleKey[] };

export interface QueryResolver {
  (bundles: QueryBundles, filters: QueryFilters): QueryResult;
}

export interface QueryDefinition {
  key: QueryKey;
  label: string;
  description: string;
  filters: readonly FilterKind[];
  requires: readonly QueryBundleKey[];
  resolve: QueryResolver;
}
