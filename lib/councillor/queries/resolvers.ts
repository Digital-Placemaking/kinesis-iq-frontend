import {
  byRatioDesc,
  categoryLabel,
  formatCount,
  pctLabel,
  ratioLabel,
  sharePct,
} from "../format";
import type { QueryResolver } from "./types";

function normalizedCategory(category: string): string {
  return categoryLabel(category).toLocaleLowerCase("en-CA");
}

function matchesCategory(
  category: string,
  selected: string | undefined
): boolean {
  return !selected || normalizedCategory(category) === normalizedCategory(selected);
}

function signedMonthlySlope(slope: number): string {
  const sign = slope > 0 ? "+" : "";
  return `${sign}${slope.toFixed(1)}/mo`;
}

export const resolveRisingCategories: QueryResolver = (bundles, filters) => {
  const data = bundles.topSignals;
  const title = "Rising Categories";

  if (!data) {
    return { status: "unavailable", title, missing: ["topSignals"] };
  }

  const rows = data.rising_categories
    .filter((row) => matchesCategory(row.category, filters.category))
    .map((row) => ({
      id: `rising-${row.category}`,
      label: categoryLabel(row.category),
      sub: `${formatCount(row.recent)} this year vs ${formatCount(
        Math.round(row.baseline_avg)
      )} baseline`,
      metric: { kind: "percent" as const, value: row.pct_change },
    }));

  if (!rows.length) {
    return {
      status: "empty",
      title,
      reason: filters.category
        ? `No rising-category signal is available for ${filters.category}.`
        : "No rising categories are available for this period.",
    };
  }

  return {
    status: "ok",
    title,
    hint: "Largest year-over-year rise vs the ward's own baseline",
    rows,
  };
};

export const resolveDriftingLocations: QueryResolver = (bundles, filters) => {
  const data = bundles.topSignals;
  const title = "Drifting Locations";

  if (!data) {
    return { status: "unavailable", title, missing: ["topSignals"] };
  }

  const rows = data.drifting_locations
    .filter((row) => !filters.fsa || row.fsa === filters.fsa)
    .map((row) => ({
      id: `drifting-${row.fsa}`,
      label: row.fsa,
      sub: "Monthly request trend over the last 6 months",
      metric: {
        kind: "text" as const,
        value: signedMonthlySlope(row.slope),
        tone: row.slope > 0 ? ("positive" as const) : ("neutral" as const),
      },
      sparkline: row.series,
    }));

  if (!rows.length) {
    return {
      status: "empty",
      title,
      reason: filters.fsa
        ? `No upward location drift was detected for ${filters.fsa}.`
        : "No drifting locations are available for this period.",
    };
  }

  return {
    status: "ok",
    title,
    hint: "Micro-areas trending up over the last 6 months",
    rows,
  };
};

export const resolveHotspots: QueryResolver = (bundles, filters) => {
  const data = bundles.hotspots;
  const title = "Hotspots";

  if (!data) {
    return { status: "unavailable", title, missing: ["hotspots"] };
  }

  const rows = data.hotspots
    .filter((row) => !filters.fsa || row.fsa === filters.fsa)
    .flatMap((row) => {
      const selectedCategory = filters.category
        ? row.categories.find((category) =>
            matchesCategory(category.category, filters.category)
          )
        : null;

      if (filters.category && !selectedCategory) return [];

      return [
        {
          id: `hotspot-${row.fsa}-${filters.category ?? "all"}`,
          label: row.fsa,
          sub: selectedCategory
            ? `${categoryLabel(selectedCategory.category)} requests in this micro-area`
            : row.categories
                .slice(0, 3)
                .map((category) => categoryLabel(category.category))
                .join(" · "),
          metric: {
            kind: "text" as const,
            value: formatCount(selectedCategory?.count ?? row.total),
            tone: "neutral" as const,
          },
          // The contract only includes an all-category series per FSA.
          sparkline: filters.category ? undefined : row.sparkline,
        },
      ];
    });

  if (!rows.length) {
    return {
      status: "empty",
      title,
      reason:
        filters.category || filters.fsa
          ? `No hotspot data is available for ${[
              filters.category,
              filters.fsa,
            ]
              .filter(Boolean)
              .join(" in ")}.`
          : "No hotspot data is available for this period.",
    };
  }

  return {
    status: "ok",
    title,
    hint: "Top micro-areas by recent request volume",
    rows,
    footnote: filters.category
      ? `Category counts cover the recent ${data.recent_months}-month window. Category-specific history is not available, so sparklines are omitted.`
      : `Totals cover the most recent ${data.recent_months} months of ${data.recent_year}.`,
  };
};

export const resolveRepeatedComplaints: QueryResolver = (bundles, filters) => {
  const data = bundles.topSignals;
  const title = "Repeated Complaints";

  if (!data) {
    return { status: "unavailable", title, missing: ["topSignals"] };
  }

  const rows = data.repeated_complaints
    .filter((row) => !filters.fsa || row.fsa === filters.fsa)
    .map((row, index) => ({
      id: `repeated-${row.fsa}-${row.type}-${index}`,
      label: row.type,
      sub: row.fsa,
      metric: {
        kind: "text" as const,
        value: formatCount(row.count),
        tone: "neutral" as const,
      },
    }));

  if (!rows.length) {
    return {
      status: "empty",
      title,
      reason: filters.fsa
        ? `No repeated complaints were found for ${filters.fsa}.`
        : "No repeated complaints are available for this period.",
    };
  }

  return {
    status: "ok",
    title,
    hint: "Same issue recurring within one micro-area",
    rows,
  };
};

export const resolveEarlyWarning: QueryResolver = (bundles, filters) => {
  const data = bundles.topSignals;
  const title = "Early Warning Flags";

  if (!data) {
    return { status: "unavailable", title, missing: ["topSignals"] };
  }

  const rows = data.early_warning
    .filter((row) => matchesCategory(row.category, filters.category))
    .map((row) => ({
      id: `warning-${row.category}`,
      label: categoryLabel(row.category),
      sub: `z-score ${row.z_score.toFixed(2)} · ${formatCount(
        row.recent
      )} vs ${formatCount(row.prior)} prior`,
      metric: { kind: "percent" as const, value: row.pct_change },
    }));

  if (!rows.length) {
    return {
      status: "empty",
      title,
      reason: filters.category
        ? `No early-warning flag is active for ${filters.category}.`
        : "No early-warning flags are active this period.",
    };
  }

  return {
    status: "ok",
    title,
    hint: "Unusual jumps vs prior years (z-score ≥ 2)",
    rows,
  };
};

export const resolveMicroAreaTrends: QueryResolver = (bundles, filters) => {
  const hotspotData = bundles.hotspots;
  const signalData = bundles.topSignals;
  const title = "Micro-Area Trends";
  const missing = [
    ...(!hotspotData ? (["hotspots"] as const) : []),
    ...(!signalData ? (["topSignals"] as const) : []),
  ];

  if (!hotspotData || !signalData) {
    return { status: "unavailable", title, missing };
  }

  const slopeByFsa = new Map(
    signalData.drifting_locations.map((row) => [row.fsa, row.slope])
  );
  const rows = hotspotData.hotspots
    .filter((row) => !filters.fsa || row.fsa === filters.fsa)
    .map((row) => {
      const slope = slopeByFsa.get(row.fsa);
      return {
        id: `micro-trend-${row.fsa}`,
        label: row.fsa,
        sub: `${formatCount(row.total)} requests · ${pctLabel(
          row.growth_pct
        )} vs baseline`,
        metric: {
          kind: "text" as const,
          value: slope === undefined ? "stable" : signedMonthlySlope(slope),
          tone:
            slope === undefined || slope === 0
              ? ("neutral" as const)
              : slope > 0
                ? ("positive" as const)
                : ("negative" as const),
        },
        sparkline: row.sparkline,
      };
    });

  if (!rows.length) {
    return {
      status: "empty",
      title,
      reason: filters.fsa
        ? `No micro-area trend is available for ${filters.fsa}.`
        : "No micro-area trends are available for this period.",
    };
  }

  return {
    status: "ok",
    title,
    hint: "Recent volume and six-month direction by micro-area",
    rows,
    footnote:
      "A stable label means the micro-area is not present in the upward-drift signal.",
  };
};

export const resolveCategoryBaselines: QueryResolver = (bundles, filters) => {
  const data = bundles.wardView;
  const title = "Category Baselines";

  if (!data) {
    return { status: "unavailable", title, missing: ["wardView"] };
  }

  const rows = [...data.RISING, ...data.FALLING]
    .filter((row) => matchesCategory(row.category, filters.category))
    .map((row, index) => ({
      id: `baseline-${row.category}-${index}`,
      label: categoryLabel(row.category),
      sub: `${formatCount(row.recent)} recent vs ${formatCount(
        Math.round(row.baseline_avg)
      )} baseline`,
      metric: { kind: "percent" as const, value: row.pct_change },
    }));

  if (!rows.length) {
    return {
      status: "empty",
      title,
      reason: filters.category
        ? `No baseline comparison is available for ${filters.category}.`
        : "No category baseline comparisons are available.",
    };
  }

  return {
    status: "ok",
    title,
    hint: "Recent category volume compared with the ward baseline",
    rows,
  };
};

export const resolveWardVsCity: QueryResolver = (bundles, filters) => {
  const wardData = bundles.wardView;
  const signalData = bundles.topSignals;
  const title = "Ward vs City";
  const missing = [
    ...(!wardData ? (["wardView"] as const) : []),
    ...(!signalData ? (["topSignals"] as const) : []),
  ];

  if (!wardData || !signalData) {
    return { status: "unavailable", title, missing };
  }

  const growthDeltaByCategory = new Map(
    signalData.rising_faster_than_city.map((row) => [
      normalizedCategory(row.category),
      row.delta_pct,
    ])
  );
  const rows = byRatioDesc(wardData["WARD VS CITY"])
    .filter((row) => matchesCategory(row.category, filters.category))
    .map((row) => {
      const delta = growthDeltaByCategory.get(normalizedCategory(row.category));
      const growthNote =
        delta === undefined ? "" : ` · growth delta ${pctLabel(delta)}`;
      return {
        id: `ward-city-${row.category}`,
        label: categoryLabel(row.category),
        sub: `ward ${sharePct(row.ward7_share)} · city ${sharePct(
          row.city_share
        )}${growthNote}`,
        metric: {
          kind: "text" as const,
          value: ratioLabel(row.ratio),
          tone: "neutral" as const,
        },
      };
    });

  if (!rows.length) {
    return {
      status: "empty",
      title,
      reason: filters.category
        ? `No ward-versus-city comparison is available for ${filters.category}.`
        : "No ward-versus-city comparisons are available.",
    };
  }

  return {
    status: "ok",
    title,
    hint: "Ward 7 share of requests compared with the citywide mix",
    rows,
    footnote:
      "Growth delta is shown when the category is rising faster in Ward 7 than citywide.",
  };
};
