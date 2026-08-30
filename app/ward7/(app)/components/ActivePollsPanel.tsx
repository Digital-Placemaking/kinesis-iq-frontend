import Link from "next/link";
import { ClipboardList, ExternalLink, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicSurveyRef } from "@/lib/survey/public-survey";
import type { PublicSurveyListItem } from "@/lib/types";

export function ActivePollsPanel({
  surveys,
  error,
}: {
  surveys: PublicSurveyListItem[];
  error?: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span>Active Polls &amp; Surveys</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            {surveys.length} live
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : surveys.length ? (
          <ul className="space-y-3">
            {surveys.map((survey) => (
              <li
                key={survey.id}
                className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-slate-800">{survey.title}</p>
                  <p className="text-xs text-slate-500">
                    {survey.kind === "poll" ? "Poll" : "Survey"} ·{" "}
                    {survey.questionCount}{" "}
                    {survey.questionCount === 1 ? "question" : "questions"}
                  </p>
                </div>
                <a
                  href={`/ward7/survey/${getPublicSurveyRef(survey)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Open <ExternalLink className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">
            No live polls or surveys for Ward 7 yet.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/ward7/admin/surveys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Megaphone className="size-4" /> Create Poll
          </Link>
          <Link
            href="/ward7/admin/surveys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ClipboardList className="size-4" /> Manage Surveys
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
