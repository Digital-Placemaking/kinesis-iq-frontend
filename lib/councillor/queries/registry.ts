import {
  resolveCategoryBaselines,
  resolveDriftingLocations,
  resolveEarlyWarning,
  resolveHotspots,
  resolveMicroAreaTrends,
  resolveRepeatedComplaints,
  resolveRisingCategories,
  resolveWardVsCity,
} from "./resolvers";
import type {
  QueryBundles,
  QueryDefinition,
  QueryFilters,
  QueryKey,
  QueryResult,
} from "./types";

export const QUERY_REGISTRY = {
  rising_categories: {
    key: "rising_categories",
    label: "Rising categories",
    description: "Categories growing fastest against their historical baseline.",
    filters: ["category"],
    requires: ["topSignals"],
    resolve: resolveRisingCategories,
  },
  drifting_locations: {
    key: "drifting_locations",
    label: "Drifting locations",
    description: "Micro-areas with a sustained upward monthly trend.",
    filters: ["fsa"],
    requires: ["topSignals"],
    resolve: resolveDriftingLocations,
  },
  hotspots: {
    key: "hotspots",
    label: "Hotspots",
    description:
      "Micro-areas with the highest recent request volume, optionally split by category.",
    filters: ["fsa", "category"],
    requires: ["hotspots"],
    resolve: resolveHotspots,
  },
  repeated_complaints: {
    key: "repeated_complaints",
    label: "Repeated complaints",
    description: "Issues that recur within the same micro-area.",
    filters: ["fsa"],
    requires: ["topSignals"],
    resolve: resolveRepeatedComplaints,
  },
  early_warning: {
    key: "early_warning",
    label: "Early warning flags",
    description: "Unusual category jumps that may need attention.",
    filters: ["category"],
    requires: ["topSignals"],
    resolve: resolveEarlyWarning,
  },
  micro_area_trends: {
    key: "micro_area_trends",
    label: "Micro-area trends",
    description: "Recent volume and six-month direction for each micro-area.",
    filters: ["fsa"],
    requires: ["hotspots", "topSignals"],
    resolve: resolveMicroAreaTrends,
  },
  category_baselines: {
    key: "category_baselines",
    label: "Category baselines",
    description: "Recent category counts compared with the ward baseline.",
    filters: ["category"],
    requires: ["wardView"],
    resolve: resolveCategoryBaselines,
  },
  ward_vs_city: {
    key: "ward_vs_city",
    label: "Ward vs city",
    description: "How Ward 7's request mix compares with the whole city.",
    filters: ["category"],
    requires: ["wardView", "topSignals"],
    resolve: resolveWardVsCity,
  },
} satisfies Record<QueryKey, QueryDefinition>;

export const QUERY_DEFINITIONS: QueryDefinition[] =
  Object.values(QUERY_REGISTRY);

export const DEFAULT_QUERY_KEY: QueryKey = "rising_categories";

export function isQueryKey(value: string | null): value is QueryKey {
  return (
    value !== null && Object.prototype.hasOwnProperty.call(QUERY_REGISTRY, value)
  );
}

export function runQuery(
  key: QueryKey,
  filters: QueryFilters,
  bundles: QueryBundles
): QueryResult {
  const definition = QUERY_REGISTRY[key];
  const missing = definition.requires.filter(
    (bundleKey) => bundles[bundleKey] === null
  );

  if (missing.length) {
    return {
      status: "unavailable",
      title: definition.label,
      missing,
    };
  }

  return definition.resolve(bundles, filters);
}
