/**
 * Live integration tests against the deployed export-csv Edge Function.
 * Skips cleanly when E2E secrets are unset so unit CI can pass without them.
 *
 * Required env:
 *   SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   E2E_USER_EMAIL
 *   E2E_USER_PASSWORD
 *   E2E_TENANT_ID
 *   E2E_SURVEY_ID
 */

import { describe, expect, it } from "vitest";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const email = process.env.E2E_USER_EMAIL || "";
const password = process.env.E2E_USER_PASSWORD || "";
const tenantId = process.env.E2E_TENANT_ID || "";
const surveyId = process.env.E2E_SURVEY_ID || "";

const hasLiveEnv = Boolean(
  supabaseUrl && anonKey && email && password && tenantId && surveyId
);

async function signInAccessToken(): Promise<string> {
  const res = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sign-in failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Sign-in response missing access_token");
  }
  return data.access_token;
}

async function callExportCsv(opts: {
  accessToken?: string | null;
  body: Record<string, unknown>;
  tenantIdHeader?: string;
}): Promise<Response> {
  const headers: Record<string, string> = {
    apikey: anonKey,
    "Content-Type": "application/json",
    "x-tenant-id": opts.tenantIdHeader ?? tenantId,
  };

  if (opts.accessToken) {
    headers.Authorization = `Bearer ${opts.accessToken}`;
  }

  return fetch(`${supabaseUrl}/functions/v1/export-csv`, {
    method: "POST",
    headers,
    body: JSON.stringify(opts.body),
  });
}

describe.skipIf(!hasLiveEnv)("export-csv live API", () => {
  it("requires auth — missing Authorization returns 401 JSON error", async () => {
    const res = await callExportCsv({
      accessToken: null,
      body: {
        table: "survey_responses",
        maxRows: 10,
        filename: "auth-test",
      },
    });

    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(typeof json.error).toBe("string");
    expect(json.error!.length).toBeGreaterThan(0);
  });

  it("requires auth — garbage Bearer token returns 401", async () => {
    const res = await callExportCsv({
      accessToken: "not-a-real-jwt",
      body: {
        table: "survey_responses",
        maxRows: 10,
        filename: "auth-garbage-test",
      },
    });

    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(typeof json.error).toBe("string");
  });

  it("rejects invalid table identifiers with 400", async () => {
    const accessToken = await signInAccessToken();
    const res = await callExportCsv({
      accessToken,
      body: {
        table: "bad;drop",
        maxRows: 10,
        filename: "validation-test",
      },
    });

    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(typeof json.error).toBe("string");
    expect(json.error!.length).toBeGreaterThan(0);
  });

  it("happy path returns CSV for E2E_SURVEY_ID", async () => {
    const accessToken = await signInAccessToken();
    const res = await callExportCsv({
      accessToken,
      body: {
        table: "survey_responses",
        columns: [
          "id",
          "survey_id",
          "question_id",
          "answer",
          "session_id",
          "created_at",
        ],
        filters: [{ column: "survey_id", op: "eq", value: surveyId }],
        order: { column: "created_at", ascending: false },
        batchSize: 200,
        maxRows: 100,
        filename: `responses-${surveyId}`,
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type") || "").toContain("text/csv");

    const text = await res.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    expect(lines.length).toBeGreaterThanOrEqual(1);
    expect(lines[0]).toMatch(/id/i);
    expect(lines[0]).toMatch(/survey_id/i);

    // If the survey has rows, expect at least one data line.
    if (lines.length > 1) {
      expect(lines[1]).toContain(surveyId);
    }
  });

  it("RLS / empty — unknown survey does not leak other tenants' rows", async () => {
    const accessToken = await signInAccessToken();
    const foreignSurveyId = "00000000-0000-4000-8000-000000000000";

    const res = await callExportCsv({
      accessToken,
      body: {
        table: "survey_responses",
        columns: ["id", "survey_id", "created_at"],
        filters: [{ column: "survey_id", op: "eq", value: foreignSurveyId }],
        maxRows: 50,
        filename: "rls-empty-test",
      },
    });

    // Depending on PostgREST/RLS, empty result is 200 header-only, or 403/404.
    if (res.status === 200) {
      expect(res.headers.get("Content-Type") || "").toContain("text/csv");
      const text = await res.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      expect(lines.length).toBeGreaterThanOrEqual(1);
      // No data rows for a survey the user cannot see.
      for (const line of lines.slice(1)) {
        expect(line).not.toContain(surveyId);
      }
      expect(lines.length).toBe(1);
    } else {
      expect([403, 404]).toContain(res.status);
    }
  });
});
