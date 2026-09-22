/**
 * Server helpers that turn a `[wardId]` route param into a Ward and apply the
 * same role scoping the backend enforces (see kinesis-iq-backend/main.py
 * `_resolve_indicators`): councillors and staff are locked to their assigned
 * ward; analysts, internal and demo observers may open any ward.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CouncillorSession, KinesisRole } from "./types";
import { DEFAULT_WARD, isWardEnabled, parseWard, type Ward } from "./wards";

export type WardParams = Promise<{ wardId: string }>;

/**
 * Resolve the ward from route params. Unknown *and* not-yet-enabled wards 404
 * here — before any session check or API call — and app/ward/[wardId]/not-found
 * explains which case it was.
 */
export async function resolveWard(params: WardParams): Promise<Ward> {
  const { wardId } = await params;
  const ward = parseWard(wardId);
  if (!ward || !isWardEnabled(ward)) notFound();
  return ward;
}

/**
 * Build a page's `generateMetadata` from a title function, so every ward page
 * gets a ward-aware <title> without repeating the params plumbing:
 *
 *   export const generateMetadata = wardMetadata((w) => `Hotspots · ${w.label}`);
 */
export function wardMetadata<P extends { wardId: string } = { wardId: string }>(
  title: (ward: Ward, params: P) => string
) {
  return async ({ params }: { params: Promise<P> }): Promise<Metadata> => {
    const resolved = await params;
    const ward = await resolveWard(params);
    return { title: title(ward, resolved) };
  };
}

const WARD_LOCKED_ROLES: KinesisRole[] = ["councillor", "staff"];

/** The ward a session is pinned to, or null if the role may roam. */
export function lockedWardFor(session: CouncillorSession): Ward | null {
  if (!WARD_LOCKED_ROLES.includes(session.role)) return null;
  // Mirrors the backend, which falls back to Ward 07 for an unassigned councillor.
  return parseWard(session.assigned_ward) ?? DEFAULT_WARD;
}

export function canViewWard(session: CouncillorSession, ward: Ward): boolean {
  const locked = lockedWardFor(session);
  return !locked || locked.id === ward.id;
}
