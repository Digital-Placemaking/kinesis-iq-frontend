/**
 * Surveys tab shell — list collector containers; full editor UI in later commits.
 */

"use client";

import type { SurveyRecord } from "@/lib/types";

interface SurveysTabContentProps {
  tenantSlug: string;
  surveys: SurveyRecord[];
}

function formatStatus(status: SurveyRecord["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function SurveysTabContent({ surveys }: SurveysTabContentProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
          Surveys
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Manage survey collections and survey questions
        </p>
      </div>

      {surveys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No surveys yet
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Survey creation and editing coming soon.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {surveys.map((survey) => (
            <li
              key={survey.id}
              className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {survey.title}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {survey.kind} · {formatStatus(survey.status)}
                  {survey.slug ? ` · ${survey.slug}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Coming soon
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
