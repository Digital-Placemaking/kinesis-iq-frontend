"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginRequest, ApiError } from "@/lib/councillor/api";
import {
  COOKIE_PATH,
  SESSION_COOKIE,
  TOKEN_COOKIE,
} from "@/lib/councillor/config";
import type { CouncillorSession } from "@/lib/councillor/types";
import { canViewWard, lockedWardFor } from "@/lib/councillor/ward-context";
import { DEFAULT_WARD, isWardEnabled, parseWard, wardPath } from "@/lib/councillor/wards";

/** The ward the submitting page belonged to (hidden `ward` field). */
function wardFromForm(formData: FormData) {
  const ward = parseWard(String(formData.get("ward") ?? ""));
  return ward && isWardEnabled(ward) ? ward : DEFAULT_WARD;
}

export interface LoginState {
  error?: string;
}

/** Cookie options shared by login set + logout delete (path must match). */
function cookieBase(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: COOKIE_PATH,
  };
}

/**
 * Turn gateway `expires_at` (unix seconds) into cookie lifetime. Falls back to
 * 1h if the value is missing or already past so we never set an immortal cookie.
 */
function cookieLifetime(expiresAt: number | undefined): {
  maxAge: number;
  expires: Date;
} {
  const nowSec = Math.floor(Date.now() / 1000);
  const fallbackSec = 60 * 60;
  const maxAge =
    typeof expiresAt === "number" && expiresAt > nowSec
      ? expiresAt - nowSec
      : fallbackSec;
  return { maxAge, expires: new Date((nowSec + maxAge) * 1000) };
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const requested = wardFromForm(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  let result;
  try {
    result = await loginRequest(email, password);
  } catch (e) {
    if (e instanceof ApiError) return { error: e.message };
    return { error: "Something went wrong signing in." };
  }

  const session: CouncillorSession = {
    email: result.user.email,
    role: result.profile.role,
    assigned_ward: result.profile.assigned_ward,
    dataset_scope: result.profile.dataset_scope,
  };

  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const base = cookieBase(secure);
  const { maxAge, expires } = cookieLifetime(result.expires_at);

  jar.set(TOKEN_COOKIE, result.access_token, { ...base, maxAge, expires });
  jar.set(SESSION_COOKIE, JSON.stringify(session), { ...base, maxAge, expires });

  // Land on the ward they signed in from, unless their role pins them elsewhere.
  redirect(
    wardPath(canViewWard(session, requested) ? requested : lockedWardFor(session)!)
  );
}

export async function logoutAction(formData: FormData) {
  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const base = cookieBase(secure);
  // Next requires matching path (and ideally same attributes) to clear cookies.
  jar.set(TOKEN_COOKIE, "", { ...base, maxAge: 0 });
  jar.set(SESSION_COOKIE, "", { ...base, maxAge: 0 });
  redirect(wardPath(wardFromForm(formData), "/login"));
}
