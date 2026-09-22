/**
 * Ward registry + URL helpers for the councillor views.
 *
 * One dynamic route serves every ward: /ward/{N}/… ↔ app/ward/[wardId]/….
 * The URL is the folder — no rewrites. proxy.ts only redirects legacy/padded
 * spellings (/ward7, /ward/07) onto it. Everything that builds a link goes
 * through `wardPath()` so the URL shape lives in one place.
 *
 * Ward ids: the backend uses zero-padded strings ("07"); URLs use the plain
 * number ("7"). `ward.id` is the API form, `ward.number` the URL form.
 */

/** Toronto's 25-ward model (2018–). */
export const TORONTO_WARDS: Record<number, string> = {
  1: "Etobicoke North",
  2: "Etobicoke Centre",
  3: "Etobicoke-Lakeshore",
  4: "Parkdale-High Park",
  5: "York South-Weston",
  6: "York Centre",
  7: "Humber River-Black Creek",
  8: "Eglinton-Lawrence",
  9: "Davenport",
  10: "Spadina-Fort York",
  11: "University-Rosedale",
  12: "Toronto-St. Paul's",
  13: "Toronto Centre",
  14: "Toronto-Danforth",
  15: "Don Valley West",
  16: "Don Valley East",
  17: "Don Valley North",
  18: "Willowdale",
  19: "Beaches-East York",
  20: "Scarborough Southwest",
  21: "Scarborough Centre",
  22: "Scarborough-Agincourt",
  23: "Scarborough North",
  24: "Scarborough-Guildwood",
  25: "Scarborough-Rouge Park",
};

export interface Ward {
  /** Backend id, zero-padded: "07". */
  id: string;
  /** URL number: 7. */
  number: number;
  name: string;
  /** Display label: "Ward 7". */
  label: string;
  /** Route root: "/ward/7". */
  basePath: string;
}

export function getWard(number: number): Ward | null {
  const name = TORONTO_WARDS[number];
  if (!name) return null;
  return {
    id: String(number).padStart(2, "0"),
    number,
    name,
    label: `Ward ${number}`,
    basePath: `/ward/${number}`,
  };
}

/**
 * Resolve a ward from any of its spellings: "7", "07", "ward7", "ward07".
 * Returns null for anything that isn't a known ward.
 */
export function parseWard(raw: string | number | null | undefined): Ward | null {
  if (raw === null || raw === undefined) return null;
  const m = String(raw).trim().toLowerCase().match(/^(?:ward)?0*(\d{1,2})$/);
  return m ? getWard(Number(m[1])) : null;
}

/** URL for a screen inside a ward: wardPath(w, "/signals") → "/ward/7/signals". */
export function wardPath(ward: Ward, path = ""): string {
  return `${ward.basePath}${path}`;
}

/** "Ward 7 · Humber River-Black Creek · last 6 months · 2025" — falsy details are skipped. */
export function wardSubtitle(
  ward: Ward,
  ...details: (string | number | null | undefined | false)[]
): string {
  return [`${ward.label} · ${ward.name}`, ...details.filter(Boolean)].join(" · ");
}

/** Default ward used when nothing else says which ward to open. */
export const DEFAULT_WARD = getWard(7)!;

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

/**
 * Which wards are live. Set NEXT_PUBLIC_ENABLED_WARDS to a comma list ("7,10")
 * or "all"; defaults to Ward 7 only. NEXT_PUBLIC_ so the client-side
 * "unavailable" page can list the same wards the server allows. Must be
 * referenced literally for Next to inline it.
 */
const ENABLED_WARDS_SETTING = (process.env.NEXT_PUBLIC_ENABLED_WARDS ?? "7").trim().toLowerCase();

const ENABLED_WARD_NUMBERS: ReadonlySet<number> | "all" =
  ENABLED_WARDS_SETTING === "all"
    ? "all"
    : new Set(
        ENABLED_WARDS_SETTING.split(",")
          .map((part) => parseWard(part)?.number)
          .filter((n): n is number => n !== undefined)
      );

/** A real ward that is switched on for this deployment. */
export function isWardEnabled(ward: Ward): boolean {
  return ENABLED_WARD_NUMBERS === "all" || ENABLED_WARD_NUMBERS.has(ward.number);
}

/** Every live ward, in ward order. */
export function enabledWards(): Ward[] {
  return Object.keys(TORONTO_WARDS)
    .map((n) => getWard(Number(n))!)
    .filter(isWardEnabled);
}
