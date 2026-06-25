"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginRequest, ApiError } from "@/lib/councillor/api";
import { SESSION_COOKIE, TOKEN_COOKIE } from "@/lib/councillor/config";
import type { CouncillorSession } from "@/lib/councillor/types";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
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
  jar.set(TOKEN_COOKIE, result.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });

  redirect("/ward7");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
  jar.delete(SESSION_COOKIE);
  redirect("/ward7/login");
}
