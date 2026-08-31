/**
 * Public survey/poll card for the visitor hub.
 */

"use client";

import Link from "next/link";
import { BarChart3, ClipboardList, Lock } from "lucide-react";
import { getTenantPath } from "@/lib/utils/subdomain";
import { getPublicSurveyRef } from "@/lib/survey/public-survey";
import type { PublicSurveyListItem } from "@/lib/types/survey";

interface PublicSurveyCardProps {
  survey: PublicSurveyListItem;
  tenantSlug: string;
  search?: string;
}

export default function PublicSurveyCard({
  survey,
  tenantSlug,
  search = "",
}: PublicSurveyCardProps) {
  const isPoll = survey.kind === "poll";
  const href = `${getTenantPath(tenantSlug, `/survey/${getPublicSurveyRef(survey)}`)}${search}`;
  const questionLabel =
    survey.questionCount === 1
      ? "1 question"
      : `${survey.questionCount} questions`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border-2 border-border/50 bg-card shadow-lg backdrop-blur-sm transition-all duration-250 hover:scale-[1.01] hover:shadow-xl">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            {isPoll ? (
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            ) : (
              <ClipboardList className="h-6 w-6 text-primary-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary">
                {survey.kind}
              </span>
              {!survey.allowAnonymous && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Email required
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold leading-tight text-foreground sm:text-xl">
              {survey.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{questionLabel}</p>
          </div>
        </div>

        {survey.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {survey.description}
          </p>
        )}

        <Link
          href={href}
          className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-250 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
        >
          {isPoll ? "Take Poll" : "Take Survey"}
        </Link>
      </div>
    </div>
  );
}
