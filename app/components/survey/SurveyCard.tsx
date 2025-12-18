/**
 * app/components/survey/SurveyCard.tsx
 * Client wrapper component for survey card with animated progress bar.
 * Handles the card structure and progress bar animation.
 */

"use client";

import { useState } from "react";
import type { Survey } from "@/lib/types/survey";
import SurveyContainer from "./SurveyContainer";

interface SurveyCardProps {
  survey: Survey;
  tenantSlug: string;
  couponId: string | null;
  email: string | null;
  showHeader?: boolean;
  onDemoSubmit?: () => void;
}

export default function SurveyCard({
  survey,
  tenantSlug,
  couponId,
  email,
  showHeader = true,
  onDemoSubmit,
}: SurveyCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const totalQuestions = survey.questions.length;
  const currentQuestion = currentQuestionIndex + 1;
  const percentage = totalQuestions > 0 ? Math.round((currentQuestion / totalQuestions) * 100) : 0;

  return (
    <div className="w-full max-w-sm flex flex-col">
      {showHeader && (
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion} of {totalQuestions}</span>
            <span>{percentage}%</span>
          </div>
        </div>
      )}
      <div className="relative h-[75vh] max-h-[580px] min-h-[450px] rounded-2xl border border-border/50 bg-card shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden">
        {/* Animated progress bar at top of card */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted/30 z-10">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      <div
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth overlay-scrollbar min-h-0"
        data-onboarding-scroll
      >
        <div className="flex-1 flex flex-col px-4 sm:px-6 pt-6 pb-4 min-w-0">
          <SurveyContainer
            survey={survey}
            tenantSlug={tenantSlug}
            couponId={couponId}
            email={email}
            onQuestionChange={setCurrentQuestionIndex}
            onDemoSubmit={onDemoSubmit}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
