/**
 * Admin Export tab — download tenant data CSV via the export-csv Edge Function.
 */

"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  downloadExportDataset,
  EXPORT_DATASETS,
  ExportCsvError,
  type ExportDatasetId,
} from "@/lib/export/csv-export";
import type { SurveyListEntry } from "@/lib/types";
import ActionButton from "@/app/components/ui/ActionButton";
import Card from "@/app/components/ui/Card";
import Spinner from "@/app/components/ui/Spinner";

interface ExportTabContentProps {
  tenantId: string;
  surveys: SurveyListEntry[];
}

export default function ExportTabContent({
  tenantId,
  surveys,
}: ExportTabContentProps) {
  const [datasetId, setDatasetId] =
    useState<ExportDatasetId>("survey_responses");
  const [surveyId, setSurveyId] = useState(surveys[0]?.survey.id ?? "");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dataset = useMemo(
    () => EXPORT_DATASETS.find((item) => item.id === datasetId)!,
    [datasetId]
  );

  const selectedSurvey = useMemo(
    () => surveys.find((entry) => entry.survey.id === surveyId) ?? null,
    [surveys, surveyId]
  );

  const needsSurvey = Boolean(dataset.requiresSurveyId);
  const canDownload = !needsSurvey || Boolean(surveyId);

  const handleDownload = async () => {
    if (needsSurvey && !surveyId) {
      setError("Select a survey to export");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsExporting(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error("Supabase environment is not configured");
      }

      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("You must be signed in to export data");
      }

      await downloadExportDataset({
        supabaseUrl,
        anonKey,
        accessToken: session.access_token,
        tenantId,
        datasetId,
        surveyId: needsSurvey ? surveyId : undefined,
      });

      setSuccess("CSV download started.");
    } catch (err) {
      if (err instanceof ExportCsvError && err.status === 429) {
        const retry = err.retryAfter
          ? ` Try again in ${err.retryAfter}s.`
          : " Please wait a minute and try again.";
        setError(`${err.message}${retry}`);
      } else {
        setError(err instanceof Error ? err.message : "Failed to export CSV");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
          Export Data
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Download tenant data as CSV. Exports use your account permissions and
          may take a moment for larger datasets.
        </p>
      </div>

      <Card className="p-4 sm:p-6" variant="elevated">
        <div className="space-y-5">
          <div>
            <label
              htmlFor="export-dataset"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Data to export
            </label>
            <select
              id="export-dataset"
              value={datasetId}
              onChange={(e) => {
                setDatasetId(e.target.value as ExportDatasetId);
                setError(null);
                setSuccess(null);
              }}
              disabled={isExporting}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              {EXPORT_DATASETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {dataset.description}
            </p>
          </div>

          {needsSurvey && (
            <div>
              <label
                htmlFor="export-survey"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Survey
              </label>
              {surveys.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  No surveys available. Create a survey before exporting
                  responses.
                </p>
              ) : (
                <>
                  <select
                    id="export-survey"
                    value={surveyId}
                    onChange={(e) => {
                      setSurveyId(e.target.value);
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={isExporting}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  >
                    {surveys.map((entry) => (
                      <option key={entry.survey.id} value={entry.survey.id}>
                        {entry.survey.title} ({entry.summary.total_responses}{" "}
                        {entry.summary.total_responses === 1
                          ? "response"
                          : "responses"}
                        )
                      </option>
                    ))}
                  </select>
                  {selectedSurvey && (
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Kind: {selectedSurvey.survey.kind} · Status:{" "}
                      {selectedSurvey.survey.status} · Unique sessions:{" "}
                      {selectedSurvey.summary.unique_sessions}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
            Limited to 5 exports per minute. RLS applies — you only receive rows
            your account can read.
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <ActionButton
              type="button"
              icon={isExporting ? undefined : Download}
              onClick={handleDownload}
              disabled={isExporting || !canDownload}
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Preparing CSV…
                </span>
              ) : (
                "Download CSV"
              )}
            </ActionButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
