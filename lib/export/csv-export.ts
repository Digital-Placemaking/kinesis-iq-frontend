/**
 * Client helpers for the deployed Supabase Edge Function `export-csv`.
 * Uses the signed-in user's JWT + anon key. Never uses the service-role key.
 */

export type ExportFilterOp =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "is"
  | "in";

export interface ExportFilter {
  column: string;
  op: ExportFilterOp;
  value: unknown;
}

export interface ExportCsvRequest {
  table: string;
  columns?: string[];
  filters?: ExportFilter[];
  order?: { column: string; ascending?: boolean };
  batchSize?: number;
  maxRows?: number;
  batchDelayMs?: number;
  filename?: string;
}

export interface ExportCsvOptions {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  tenantId: string;
  body: ExportCsvRequest;
}

/**
 * Error thrown when the export-csv Edge Function returns a non-2xx response.
 * Carries HTTP status and optional Retry-After (used for 429 rate limits).
 */
export class ExportCsvError extends Error {
  status: number;
  retryAfter: string | null;

  constructor(message: string, status: number, retryAfter: string | null = null) {
    super(message);
    this.name = "ExportCsvError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

/** Edge Function filename rule: letters, numbers, `_`, `.`, `-` only (no path / extension required). */
const SAFE_FILENAME = /^[\w.-]+$/;

/**
 * Validate and normalize a download basename for the Edge Function.
 * Strips a trailing `.csv` if present; throws if characters are unsafe.
 */
export function sanitizeExportFilename(name: string): string {
  const trimmed = name.trim().replace(/\.csv$/i, "");
  if (!SAFE_FILENAME.test(trimmed)) {
    throw new Error(
      "Filename may only contain letters, numbers, underscores, dots, and hyphens"
    );
  }
  return trimmed;
}

/**
 * POST to the deployed `export-csv` Edge Function with the user JWT + anon key.
 * Returns the CSV as a Blob and a filename from Content-Disposition (or a fallback).
 * Throws ExportCsvError on 4xx/5xx (including 401 auth and 429 rate limit).
 */
export async function exportCsv(opts: ExportCsvOptions): Promise<{
  blob: Blob;
  filename: string;
}> {
  const filename = sanitizeExportFilename(
    opts.body.filename ?? `${opts.body.table}-export`
  );

  const res = await fetch(`${opts.supabaseUrl}/functions/v1/export-csv`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      apikey: opts.anonKey,
      "Content-Type": "application/json",
      "x-tenant-id": opts.tenantId,
    },
    body: JSON.stringify({
      ...opts.body,
      filename,
    }),
  });

  if (!res.ok) {
    let message = res.statusText || `Export failed (${res.status})`;
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      /* non-JSON error body */
    }

    if (res.status === 429) {
      message =
        message ||
        "Export rate limit reached. Please wait a minute and try again.";
    }

    throw new ExportCsvError(
      message,
      res.status,
      res.headers.get("Retry-After")
    );
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const matched = disposition?.match(/filename="?([^"]+)"?/i);
  const downloadName = matched?.[1] ?? `${filename}.csv`;

  return { blob, filename: downloadName };
}

/**
 * Start a browser download for a Blob by creating a temporary object URL and
 * programmatically clicking an `<a download>` link. Always revokes the URL.
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Supported admin export datasets */
export type ExportDatasetId =
  | "survey_responses"
  | "surveys"
  | "survey_questions"
  | "email_opt_ins"
  | "coupons"
  | "issued_coupons";

export interface ExportDatasetDefinition {
  id: ExportDatasetId;
  label: string;
  description: string;
  table: string;
  columns: string[];
  order: { column: string; ascending: boolean };
  /** When true, UI requires a survey picker and filters by survey_id */
  requiresSurveyId?: boolean;
  defaultFilename: string;
}

/**
 * Preset export targets shown in the admin Export tab.
 * Each entry maps UI labels to a PostgREST table, columns, and default sort.
 * Tenant scoping is enforced by RLS via `x-tenant-id` + the user JWT.
 */
export const EXPORT_DATASETS: ExportDatasetDefinition[] = [
  {
    id: "survey_responses",
    label: "Survey responses",
    description: "Answers collected for a selected survey",
    table: "survey_responses",
    columns: [
      "id",
      "survey_id",
      "question_id",
      "answer",
      "session_id",
      "created_at",
    ],
    order: { column: "created_at", ascending: false },
    requiresSurveyId: true,
    defaultFilename: "survey-responses",
  },
  {
    id: "surveys",
    label: "Survey list",
    description: "All surveys and polls for this tenant",
    table: "surveys",
    columns: [
      "id",
      "title",
      "slug",
      "description",
      "kind",
      "status",
      "settings",
      "starts_at",
      "ends_at",
      "created_by",
      "created_at",
    ],
    order: { column: "created_at", ascending: false },
    defaultFilename: "surveys",
  },
  {
    id: "survey_questions",
    label: "Survey questions",
    description: "Shared question bank",
    table: "survey_questions",
    columns: [
      "id",
      "question",
      "type",
      "options",
      "order_index",
      "is_active",
    ],
    order: { column: "order_index", ascending: true },
    defaultFilename: "survey-questions",
  },
  {
    id: "email_opt_ins",
    label: "Email opt-ins",
    description: "Visitor emails that opted in to marketing",
    table: "email_opt_ins",
    columns: ["id", "email", "consent_at"],
    order: { column: "consent_at", ascending: false },
    defaultFilename: "email-opt-ins",
  },
  {
    id: "coupons",
    label: "Coupons",
    description: "Coupon templates / offers",
    table: "coupons",
    columns: [
      "id",
      "title",
      "description",
      "discount",
      "image_url",
      "expires_at",
      "active",
      "created_at",
    ],
    order: { column: "created_at", ascending: false },
    defaultFilename: "coupons",
  },
  {
    id: "issued_coupons",
    label: "Issued coupons",
    description: "Codes issued to visitors (redeemed / revoked / expired)",
    table: "issued_coupons",
    columns: [
      "id",
      "coupon_id",
      "code",
      "status",
      "max_redemptions",
      "redemptions_count",
      "issued_to",
      "email",
      "expires_at",
      "issued_at",
      "redeemed_at",
      "revoked_at",
      "metadata",
    ],
    order: { column: "issued_at", ascending: false },
    defaultFilename: "issued-coupons",
  },
];

/**
 * Look up a preset export dataset by id (e.g. `"coupons"`, `"email_opt_ins"`).
 */
export function getExportDataset(
  id: ExportDatasetId
): ExportDatasetDefinition | undefined {
  return EXPORT_DATASETS.find((dataset) => dataset.id === id);
}

/**
 * Build the export request for a preset dataset, call `exportCsv`, then trigger
 * a browser download. When the dataset requires a survey, filters by `survey_id`.
 */
export async function downloadExportDataset(opts: {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  tenantId: string;
  datasetId: ExportDatasetId;
  surveyId?: string;
  filename?: string;
}): Promise<void> {
  const dataset = getExportDataset(opts.datasetId);
  if (!dataset) {
    throw new Error(`Unknown export dataset: ${opts.datasetId}`);
  }

  if (dataset.requiresSurveyId && !opts.surveyId) {
    throw new Error("Select a survey to export");
  }

  const safeSurveyId = opts.surveyId?.replace(/[^a-zA-Z0-9_-]/g, "") ?? "";
  const filename =
    opts.filename ??
    (dataset.requiresSurveyId && safeSurveyId
      ? `${dataset.defaultFilename}-${safeSurveyId}`
      : dataset.defaultFilename);

  const filters: ExportFilter[] = [];
  if (dataset.requiresSurveyId && opts.surveyId) {
    filters.push({ column: "survey_id", op: "eq", value: opts.surveyId });
  }

  const { blob, filename: downloadName } = await exportCsv({
    supabaseUrl: opts.supabaseUrl,
    anonKey: opts.anonKey,
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: {
      table: dataset.table,
      columns: [...dataset.columns],
      filters: filters.length > 0 ? filters : undefined,
      order: dataset.order,
      batchSize: 200,
      maxRows: 10000,
      filename,
    },
  });

  triggerBrowserDownload(blob, downloadName);
}

/**
 * Convenience wrapper that exports survey responses for one survey.
 * Prefer `downloadExportDataset({ datasetId: "survey_responses", surveyId })`.
 */
export async function downloadSurveyResponsesCsv(opts: {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  tenantId: string;
  surveyId: string;
  filename?: string;
}): Promise<void> {
  return downloadExportDataset({
    ...opts,
    datasetId: "survey_responses",
  });
}
