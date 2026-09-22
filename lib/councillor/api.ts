/**
 * Server-only client for Hansen's FastAPI councillor gateway.
 *
 * All calls run server-side (server components / server actions) so the bearer
 * token stays in an httpOnly cookie and never reaches the browser. Live-wired:
 * the screens call these directly; there are no fixtures.
 */
import { cookies } from "next/headers";
import {
  COUNCILLOR_API_URL,
  SESSION_COOKIE,
  TOKEN_COOKIE,
} from "./config";
import type {
  CouncillorSession,
  HotspotsBundle,
  LoginResult,
  TopSignals,
  WardStoryView,
  WeeklyOverviewResponse,
} from "./types";
import type { Bundles } from "./drilldown";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function authedFetch<T>(path: string): Promise<T> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) throw new ApiError(401, "Not authenticated");

  let res: Response;
  try {
    res = await fetch(`${COUNCILLOR_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, `Cannot reach the councillor API at ${COUNCILLOR_API_URL}`);
  }
  if (!res.ok) {
    throw new ApiError(res.status, `${path} → ${res.status}`);
  }
  return (await res.json()) as T;
}

/** POST /login — used by the login action; does not require an existing token. */
export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResult> {
  let res: Response;
  try {
    res = await fetch(`${COUNCILLOR_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, `Cannot reach the councillor API at ${COUNCILLOR_API_URL}`);
  }
  if (!res.ok) {
    throw new ApiError(res.status, res.status === 401 ? "Invalid credentials" : "Login failed");
  }
  return (await res.json()) as LoginResult;
}

/**
 * Read the session stored at login (role/ward/scope).
 * Requires both session + access-token cookies so an expired JWT cannot leave
 * the UI looking signed-in while API calls 401.
 */
export async function getSession(): Promise<CouncillorSession | null> {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!token || !raw) return null;
  try {
    return JSON.parse(raw) as CouncillorSession;
  } catch {
    return null;
  }
}

/**
 * Every ward-scoped call carries `ward_id` (backend form, e.g. "07").
 * /weekly-overview honours it (councillor/staff are still pinned to their
 * assigned ward server-side). The /story/* endpoints currently serve a single
 * Ward 07 bundle and ignore the param — it is sent now so they pick it up as
 * soon as per-ward story bundles exist.
 */
function wardQuery(wardId: string): string {
  return `?ward_id=${encodeURIComponent(wardId)}`;
}

export function getWeeklyOverview(wardId: string) {
  return authedFetch<WeeklyOverviewResponse>(`/weekly-overview${wardQuery(wardId)}`);
}

export function getTopSignals(wardId: string) {
  return authedFetch<TopSignals>(`/story/top-signals${wardQuery(wardId)}`);
}

export function getWardView(wardId: string) {
  return authedFetch<WardStoryView>(`/story/ward-view${wardQuery(wardId)}`);
}

export function getHotspots(wardId: string) {
  return authedFetch<HotspotsBundle>(`/story/hotspots${wardQuery(wardId)}`);
}

/** Value of a settled promise, or null if it rejected. */
export function settledValue<T>(r: PromiseSettledResult<T>): T | null {
  return r.status === "fulfilled" ? r.value : null;
}

/**
 * All three story bundles for a ward, each null if its endpoint failed. The
 * drill-down views slice these (see drilldown.ts) rather than fetching more.
 */
export async function loadStoryBundles(wardId: string): Promise<Bundles> {
  const [ts, wv, hs] = await Promise.allSettled([
    getTopSignals(wardId),
    getWardView(wardId),
    getHotspots(wardId),
  ]);
  return { ts: settledValue(ts), wv: settledValue(wv), hs: settledValue(hs) };
}
