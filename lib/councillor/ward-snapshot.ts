import { createHash } from "node:crypto";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authedFetch, getSession } from "./api";
import { TOKEN_COOKIE } from "./config";
import type { Bundles } from "./drilldown";
import type { HotspotsBundle, TopSignals, WardStoryView, WeeklyOverviewResponse } from "./types";
import { canViewWard, lockedWardFor } from "./ward-context";
import { parseWard, wardPath } from "./wards";

interface WardSnapshot extends Bundles {
  overview: WeeklyOverviewResponse | null;
}

const inFlight = new Map<string, Promise<WardSnapshot>>();

async function snapshotRequest(wardId: string) {
  const ward = parseWard(wardId)!;
  const [session, jar] = await Promise.all([getSession(), cookies()]);
  const token = jar.get(TOKEN_COOKIE)?.value;
  if (!session || !token) redirect(wardPath(ward, "/login"));
  if (!canViewWard(session, ward)) redirect(wardPath(lockedWardFor(session)!));

  // The gateway chooses the analysis date, resolution, and baseline.
  const query = new URLSearchParams({ ward_id: wardId }).toString();
  const key = createHash("sha256").update(token).update("\0").update(query).digest("hex");

  return { token, query, tag: `ward-snapshot:${key}` };
}

export async function wardSnapshotTag(wardId: string) {
  return (await snapshotRequest(wardId)).tag;
}

export const loadWardSnapshot = cache(async (wardId: string): Promise<WardSnapshot> => {
  const { token, query, tag } = await snapshotRequest(wardId);
  const pending = inFlight.get(tag);
  if (pending) return pending;

  // The bearer stays server-side. Only its digest contributes to the shared
  // cache key. Cache partial results too so navigation never acts as a retry.
  const load = unstable_cache(async () => {
    const [overview, ts, wv, hs] = await Promise.all([
      authedFetch<WeeklyOverviewResponse>(`/weekly-overview?${query}`, token).catch(() => null),
      authedFetch<TopSignals>(`/story/top-signals?${query}`, token).catch(() => null),
      authedFetch<WardStoryView>(`/story/ward-view?${query}`, token).catch(() => null),
      authedFetch<HotspotsBundle>(`/story/hotspots?${query}`, token).catch(() => null),
    ]);
    return { overview, ts, wv, hs };
  }, [tag], { tags: [tag], revalidate: 3600 });

  const request = load().finally(() => inFlight.delete(tag));
  inFlight.set(tag, request);
  return request;
});
