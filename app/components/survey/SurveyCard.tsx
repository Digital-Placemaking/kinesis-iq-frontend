/**
 * app/components/survey/SurveyCard.tsx
 * Client wrapper component for survey card with animated progress bar.
 * Handles the card structure and progress bar animation.
 */

"use client";

import { useState } from "react";
import type { Survey } from "@/lib/types/survey";
import SurveyContainer from "./SurveyContainer";
import SurveyProgressBar from "./SurveyProgressBar";

interface SurveyCardProps {
  survey: Survey;
  tenantSlug: string;
  couponId: string | null;
  email: string | null;
}

export default function SurveyCard({
  survey,
  tenantSlug,
  couponId,
  email,
}: SurveyCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  return (
    <div className="relative w-full max-w-sm h-[85vh] max-h-[600px] min-h-[500px] rounded-2xl border border-border/50 bg-card shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden">
      <SurveyProgressBar
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={survey.questions.length}
      />
      <div
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth overlay-scrollbar min-h-0"
        data-onboarding-scroll
      >
        <div className="flex-1 flex flex-col px-5 sm:px-8 pt-14 pb-6 min-w-0">
          <SurveyContainer
            survey={survey}
            tenantSlug={tenantSlug}
            couponId={couponId}
            email={email}
            onQuestionChange={setCurrentQuestionIndex}
          />
        </div>
      </div>
    </div>
  );
}
