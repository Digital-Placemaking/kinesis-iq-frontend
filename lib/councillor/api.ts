/**
 * Server-only client for Hansen's FastAPI councillor gateway.
 *
 * All calls run server-side (server components / server actions) so the bearer
 * token stays in an httpOnly cookie and never reaches the browser.
 */
import { decodeJwt } from "jose";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  COUNCILLOR_API_URL,
  SESSION_COOKIE,
  TOKEN_COOKIE,
} from "./config";
import type { CouncillorSession, LoginResult } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function authedFetch<T>(path: string, token: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${COUNCILLOR_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
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
 * Check token expiry before serving cached ward data. The gateway validates
 * the token when building each snapshot, and cache keys bind to the full token.
 */
export const getSession = cache(async (): Promise<CouncillorSession | null> => {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!token || !raw) return null;
  try {
    const { exp } = decodeJwt(token);
    if (typeof exp !== "number" || exp <= Date.now() / 1000) return null;
    return JSON.parse(raw) as CouncillorSession;
  } catch {
    return null;
  }
});
