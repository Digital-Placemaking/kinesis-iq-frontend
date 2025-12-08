/**
 * app/components/survey/SurveyProgressBar.tsx
 * Animated progress bar component for survey forms.
 * Uses Framer Motion for smooth animations.
 */

"use client";

import { motion } from "framer-motion";

interface SurveyProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function SurveyProgressBar({
  currentQuestion,
  totalQuestions,
}: SurveyProgressBarProps) {
  const percentage =
    totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted/50 z-10">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-primary to-primary/90 shadow-sm"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </div>
  );
}
