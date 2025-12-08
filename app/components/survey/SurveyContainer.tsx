/**
 * app/components/survey/SurveyContainer.tsx
 * Survey container component.
 * Main container for survey forms that manages question state, navigation, and submission.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Survey, QuestionAnswer } from "@/lib/types/survey";
import { submitSurveyAnswers } from "@/app/actions";
import QuestionCard from "./QuestionCard";
import SurveyProgress from "./SurveyProgress";
import SurveyNavigation from "./SurveyNavigation";

interface SurveyContainerProps {
  survey: Survey;
  tenantSlug: string;
  couponId: string | null;
  email: string | null;
  onQuestionChange?: (index: number) => void;
}

export default function SurveyContainer({
  survey,
  tenantSlug,
  couponId,
  email,
  onQuestionChange,
}: SurveyContainerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial question index with parent
  useEffect(() => {
    onQuestionChange?.(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard against empty survey
  if (!survey.questions || survey.questions.length === 0) {
    if (typeof window !== "undefined") {
      if (couponId) {
        window.location.href = `/${tenantSlug}/coupons/${couponId}/completed?email=${encodeURIComponent(
          email || ""
        )}`;
      } else {
        window.location.href = `/${tenantSlug}/survey/completed`;
      }
    }
    return null;
  }

  const currentQuestion = survey.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="rounded-xl border-2 border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No questions available for this survey.
        </p>
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion.id] || null;

  const handleAnswerChange = (answer: QuestionAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [answer.question_id]: answer,
    }));
    setError(null);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    // Check if current question has an answer (all questions are required)
    const answer = answers[currentQuestion.id];

    // Check if answer is missing or empty
    let hasAnswer = false;
    if (answer) {
      // For multiple_choice, check if array is not empty
      if (currentQuestion.type === "multiple_choice" && answer.answer_text) {
        try {
          const parsed = JSON.parse(answer.answer_text);
          hasAnswer = Array.isArray(parsed) && parsed.length > 0;
        } catch {
          hasAnswer = false;
        }
      } else {
        // For other types, check if any field has a value
        hasAnswer =
          (answer.answer_text !== null &&
            answer.answer_text !== undefined &&
            answer.answer_text !== "") ||
          (answer.answer_number !== null &&
            answer.answer_number !== undefined) ||
          (answer.answer_boolean !== null &&
            answer.answer_boolean !== undefined);
      }
    }

    if (!hasAnswer) {
      setError("Please answer this question");
      return;
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      onQuestionChange?.(newIndex);
      setError(null);
    }
  };

  /**
   * Handles survey form submission
   *
   * Flow:
   * 1. Validates all questions have answers
   * 2. Submits answers to survey_responses table
   * 3. submitSurveyAnswers stores email in email_opt_ins table (if provided)
   * 4. Redirects to coupon completion page
   *
   * Note: After submission, the user's email is stored in email_opt_ins,
   * making them a "returning user" for future coupon claims.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all questions have answers
    // All questions are required (schema doesn't enforce this, so we do it here)
    const missingAnswers = survey.questions.filter((q) => {
      const answer = answers[q.id];
      if (!answer) return true;

      // For multiple_choice, check if array is not empty
      if (q.type === "multiple_choice" && answer.answer_text) {
        try {
          const parsed = JSON.parse(answer.answer_text);
          return !Array.isArray(parsed) || parsed.length === 0;
        } catch {
          return true;
        }
      }

      // For other types, check if any field has a value
      return (
        (!answer.answer_text || answer.answer_text === "") &&
        (answer.answer_number === null || answer.answer_number === undefined) &&
        (answer.answer_boolean === null || answer.answer_boolean === undefined)
      );
    });

    if (missingAnswers.length > 0) {
      // Find first missing question and navigate to it
      const firstMissing = survey.questions.findIndex(
        (q) => q.id === missingAnswers[0].id
      );
      setCurrentQuestionIndex(firstMissing);
      setError("Please answer all questions");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submission = {
        survey_id: survey.tenant_id, // Use tenant_id as survey identifier since no surveys table
        coupon_id: couponId,
        email: email || null,
        answers: Object.values(answers),
      };

      const result = await submitSurveyAnswers(tenantSlug, submission);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        // Redirect to completion page using window.location to preserve theme
        // This ensures a full navigation that applies theme from localStorage
        if (couponId) {
          // Coupon survey - redirect to coupon completion
          const redirectUrl = `/${tenantSlug}/coupons/${couponId}/completed?email=${encodeURIComponent(
            email || ""
          )}`;
          if (typeof window !== "undefined") {
            window.location.href = redirectUrl;
          }
        } else {
          // Anonymous survey - redirect to survey completion
          if (typeof window !== "undefined") {
            window.location.href = `/${tenantSlug}/survey/completed`;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col min-h-0">
      {error && (
        <div className="mb-4 rounded-lg border-2 border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shadow-sm flex-shrink-0">
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <QuestionCard
          question={currentQuestion}
          answer={currentAnswer}
          onChange={handleAnswerChange}
        />
      </div>

      <div className="flex-shrink-0 mt-auto pt-4 pb-2 space-y-2">
        <SurveyNavigation
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={survey.questions.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isNextDisabled={
            !currentAnswer ||
            (!currentAnswer.answer_text &&
              !currentAnswer.answer_number &&
              currentAnswer.answer_boolean === null)
          }
          isSubmitting={isSubmitting}
        />
      </div>
    </form>
  );
}
