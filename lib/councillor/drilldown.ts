/**
 * Drill-down selectors for the Ward 7 signal tiles.
 *
 * The councillor gateway exposes no per-category / per-micro-area endpoints —
 * /story/top-signals, /story/ward-view and /story/hotspots each return the whole
 * ward bundle. So every drill-down view is a *slice* of those three bundles,
 * computed here rather than fetched. Keeping the slicing in one pure module
 * means the pages stay dumb and the joins are testable.
 *
 * Join keys, and their gotchas:
 *  - category: the bundles mix "Property" and raw column names like "Is_Admin"
 *    (see format.categoryLabel), so all matching goes through `catKey()`.
 *  - fsa: consistent 3-char uppercase across bundles.
 *  - repeated_complaints[].type is a raw 311 service-request type, NOT one of the
 *    ten fixed categories. `inferCategory` maps it by keyword — a heuristic, and
 *    the UI labels it as inferred.
 */
import type {
  DriftingLocation,
  EarlyWarning,
  Hotspot,
  HotspotCategory,
  PctOrNew,
  RepeatedComplaint,
  RisingFasterThanCity,
  TopSignals,
  WardStoryView,
  WardVsCity,
  HotspotsBundle,
} from "./types";
import { FIXED_CATEGORIES } from "./types";
import { categoryLabel } from "./format";

// ---------------------------------------------------------------------------
// Keys + slugs
// ---------------------------------------------------------------------------

/** Normalised join key for a category from any bundle ("Is_Admin" → "admin"). */
export function catKey(raw: string): string {
  return categoryLabel(raw).toLowerCase().replace(/[^a-z]/g, "");
}

/** URL slug for a category ("Water/Sewer" → "water-sewer"). */
export function categorySlug(raw: string): string {
  return categoryLabel(raw)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolve a URL slug back to its canonical fixed-category label, or null. */
export function categoryFromSlug(slug: string): string | null {
  const want = slug.toLowerCase().replace(/[^a-z]/g, "");
  return FIXED_CATEGORIES.find((c) => catKey(c) === want) ?? null;
}

/** Normalise an FSA path segment ("m3n" → "M3N"). */
export function fsaSlug(raw: string): string {
  return raw.trim().toUpperCase();
}

// ---------------------------------------------------------------------------
// Repeated-complaint type → fixed category (heuristic)
// ---------------------------------------------------------------------------

/**
 * Keyword rules, first match wins. Ordered most-specific first: "Residential Bin
 * Lid Damaged" must land on Waste, not on Property via "residential".
 *
 * Every alternative is \b-anchored. Bare substring matching is wrong here — the
 * sandbox dataset's "Streetlight Out" was classified as Trees because "Street"
 * contains "tree".
 */
const TYPE_RULES: { category: string; patterns: RegExp }[] = [
  { category: "Waste", patterns: /\b(bins?|garbage|waste|litter|recycl\w*|organics?|dump\w*)\b/i },
  { category: "Animal", patterns: /\b(animals?|wildlife|raccoons?|rats?|rodents?|dogs?|cats?|coyotes?|skunks?|bees?|wasps?)\b/i },
  { category: "Trees", patterns: /\b(trees?|branch(es)?|stumps?|forestry|hedges?)\b/i },
  { category: "Water/Sewer", patterns: /\b(water|sewers?|catch\s*basins?|flood\w*|drains?|hydrants?|watermains?)\b/i },
  { category: "Noise", patterns: /\b(noise|amplified|loud)\b/i },
  { category: "Parking", patterns: /\b(parking|abandoned\s*vehicles?)\b/i },
  { category: "Roads", patterns: /\b(roads?|streets?|streetlights?|potholes?|sidewalks?|curbs?|snow|ice|boulevards?|traffic|signs?|lights?)\b/i },
  { category: "Property", patterns: /\b(property|standards|maintenance|violations?|graffiti|fences?|grass|weeds?|buildings?)\b/i },
  { category: "Admin", patterns: /\b(admin\w*|licen\w*|permits?|inquir\w*|tax(es)?)\b/i },
];

/** Best-guess fixed category for a raw 311 request type. Null when unmatched. */
export function inferCategory(type: string): string | null {
  for (const r of TYPE_RULES) if (r.patterns.test(type)) return r.category;
  return null;
}

// ---------------------------------------------------------------------------
// Bundles in / detail out
// ---------------------------------------------------------------------------

export interface Bundles {
  ts: TopSignals | null;
  wv: WardStoryView | null;
  hs: HotspotsBundle | null;
}

/** One micro-area's slice of a single category. */
export interface CategoryArea {
  fsa: string;
  count: number;
  /** count / total requests in that micro-area, 0–1. */
  shareOfArea: number;
  areaTotal: number;
  areaGrowth: PctOrNew;
}

export interface CategoryDetail {
  category: string;
  slug: string;
  /** Year-over-year vs the ward's own baseline; null when the bundle omits it. */
  yoy: { recent: number; baseline_avg: number; pct_change: PctOrNew } | null;
  /** "rising" / "falling" — which ward-view list the category came from. */
  direction: "rising" | "falling" | null;
  /** Rank inside the RISING list (1-based), null when not rising. */
  risingRank: number | null;
  vsCity: WardVsCity | null;
  fasterThanCity: RisingFasterThanCity | null;
  earlyWarning: EarlyWarning | null;
  /** Monthly slope from ward-view DRIFTING, requests/month. */
  driftSlope: number | null;
  /** Micro-areas carrying this category, biggest first. */
  areas: CategoryArea[];
  /** Total of `areas[].count` — the category's volume across ranked hotspots. */
  areaTotal: number;
  /** Repeated complaints whose type maps to this category (heuristic). */
  repeated: RepeatedComplaint[];
  /** Ward-wide share of this category among all ranked hotspot requests, 0–1. */
  recentYear: number | null;
  recentMonths: number | null;
}

export function buildCategoryDetail(
  slugOrLabel: string,
  { ts, wv, hs }: Bundles
): CategoryDetail | null {
  const category = categoryFromSlug(slugOrLabel) ?? categoryFromSlug(catKey(slugOrLabel));
  if (!category) return null;
  const key = catKey(category);
  const by = <T extends { category: string }>(rows: T[] | undefined) =>
    rows?.find((r) => catKey(r.category) === key) ?? null;

  const risingList = wv?.RISING ?? ts?.rising_categories ?? [];
  const risingIdx = risingList.findIndex((r) => catKey(r.category) === key);
  const rising = risingIdx >= 0 ? risingList[risingIdx] : null;
  const falling = by(wv?.FALLING);
  const yoyRow = rising ?? falling;

  const areas: CategoryArea[] = (hs?.hotspots ?? [])
    .map((h) => {
      const hit = h.categories.find((c) => catKey(c.category) === key);
      if (!hit) return null;
      return {
        fsa: h.fsa,
        count: hit.count,
        shareOfArea: h.total ? hit.count / h.total : 0,
        areaTotal: h.total,
        areaGrowth: h.growth_pct,
      } satisfies CategoryArea;
    })
    .filter((a): a is CategoryArea => a !== null)
    .sort((a, b) => b.count - a.count);

  const repeated = (ts?.repeated_complaints ?? wv?.["REPEATED COMPLAINTS"] ?? [])
    .filter((r) => inferCategory(r.type) === category)
    .sort((a, b) => b.count - a.count);

  return {
    category,
    slug: categorySlug(category),
    yoy: yoyRow
      ? {
          recent: yoyRow.recent,
          baseline_avg: yoyRow.baseline_avg,
          pct_change: yoyRow.pct_change,
        }
      : null,
    direction: rising ? "rising" : falling ? "falling" : null,
    risingRank: risingIdx >= 0 ? risingIdx + 1 : null,
    vsCity: by(wv?.["WARD VS CITY"]),
    fasterThanCity: by(ts?.rising_faster_than_city),
    earlyWarning: by(wv?.["EARLY WARNING"] ?? ts?.early_warning),
    driftSlope: by(wv?.DRIFTING)?.slope ?? null,
    areas,
    areaTotal: areas.reduce((s, a) => s + a.count, 0),
    repeated,
    recentYear: ts?.meta.recent_year ?? wv?.meta.recent_year ?? hs?.recent_year ?? null,
    recentMonths: hs?.recent_months ?? null,
  };
}

/** Every category that has at least one bundle row — used for static params + nav. */
export function listCategories({ ts, wv, hs }: Bundles): string[] {
  const seen = new Set<string>();
  const push = (raw: string) => {
    const c = categoryFromSlug(catKey(raw));
    if (c) seen.add(c);
  };
  (wv?.RISING ?? []).forEach((r) => push(r.category));
  (wv?.FALLING ?? []).forEach((r) => push(r.category));
  (wv?.DRIFTING ?? []).forEach((r) => push(r.category));
  (wv?.["WARD VS CITY"] ?? []).forEach((r) => push(r.category));
  (ts?.rising_categories ?? []).forEach((r) => push(r.category));
  (hs?.hotspots ?? []).forEach((h) => h.categories.forEach((c) => push(c.category)));
  return [...seen];
}

// ---------------------------------------------------------------------------
// Micro-area drill-down
// ---------------------------------------------------------------------------

export interface AreaCategory extends HotspotCategory {
  /** count / hotspot total, 0–1. */
  share: number;
  /** Ward-level YoY for this category, when the ward view carries one. */
  wardPct: PctOrNew | null;
  /** True when the ward view flags this category as an early warning. */
  flagged: boolean;
}

export interface AreaDetail {
  fsa: string;
  hotspot: Hotspot | null;
  /** 1-based rank by recent volume among hotspots. */
  rank: number | null;
  /** Peers, for the "how it compares" tile. */
  peers: { fsa: string; total: number; growth_pct: PctOrNew }[];
  drift: DriftingLocation | null;
  categories: AreaCategory[];
  repeated: RepeatedComplaint[];
  /** Share of all ranked-hotspot requests that land in this FSA, 0–1. */
  shareOfHotspots: number;
  recentYear: number | null;
  recentMonths: number | null;
}

export function buildAreaDetail(
  rawFsa: string,
  { ts, wv, hs }: Bundles
): AreaDetail | null {
  const fsa = fsaSlug(rawFsa);
  const hotspots = hs?.hotspots ?? wv?.["TOP HOTSPOTS"] ?? [];
  const idx = hotspots.findIndex((h) => h.fsa === fsa);
  const hotspot = idx >= 0 ? hotspots[idx] : null;

  const drift =
    (ts?.drifting_locations ?? wv?.["TOP DRIFTING LOCATIONS"] ?? []).find(
      (d) => d.fsa === fsa
    ) ?? null;

  const repeated = (ts?.repeated_complaints ?? wv?.["REPEATED COMPLAINTS"] ?? [])
    .filter((r) => r.fsa === fsa)
    .sort((a, b) => b.count - a.count);

  // Nothing anywhere in the bundles knows this FSA → treat as not found.
  if (!hotspot && !drift && repeated.length === 0) return null;

  const wardPctBy = new Map(
    [...(wv?.RISING ?? []), ...(wv?.FALLING ?? [])].map((r) => [
      catKey(r.category),
      r.pct_change,
    ])
  );
  const flagged = new Set(
    (wv?.["EARLY WARNING"] ?? ts?.early_warning ?? [])
      .filter((e) => e.flag !== false)
      .map((e) => catKey(e.category))
  );

  const total = hotspot?.total ?? 0;
  const categories: AreaCategory[] = (hotspot?.categories ?? [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      ...c,
      share: total ? c.count / total : 0,
      wardPct: wardPctBy.get(catKey(c.category)) ?? null,
      flagged: flagged.has(catKey(c.category)),
    }));

  const allTotal = hotspots.reduce((s, h) => s + h.total, 0);

  return {
    fsa,
    hotspot,
    rank: idx >= 0 ? idx + 1 : null,
    peers: hotspots.map((h) => ({
      fsa: h.fsa,
      total: h.total,
      growth_pct: h.growth_pct,
    })),
    drift,
    categories,
    repeated,
    shareOfHotspots: allTotal && total ? total / allTotal : 0,
    recentYear: hs?.recent_year ?? ts?.meta.recent_year ?? null,
    recentMonths: hs?.recent_months ?? null,
  };
}

/** Every micro-area named anywhere in the bundles. */
export function listAreas({ ts, wv, hs }: Bundles): string[] {
  const seen = new Set<string>();
  (hs?.hotspots ?? []).forEach((h) => seen.add(h.fsa));
  (wv?.["TOP HOTSPOTS"] ?? []).forEach((h) => seen.add(h.fsa));
  (ts?.drifting_locations ?? []).forEach((d) => seen.add(d.fsa));
  (ts?.repeated_complaints ?? []).forEach((r) => seen.add(r.fsa));
  return [...seen];
}
