/**
 * app/components/survey/SurveyContainer.tsx
 * Survey container component.
 * Main container for survey forms that manages question state, navigation, and submission.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Survey, QuestionAnswer } from "@/lib/types/survey";
import { submitSurveyAnswers } from "@/app/actions";
import QuestionCard from "./QuestionCard";
import SurveyNavigation from "./SurveyNavigation";

interface SurveyContainerProps {
  survey: Survey;
  tenantSlug: string;
  couponId: string | null;
  email: string | null;
  onQuestionChange?: (index: number) => void;
  onDemoSubmit?: () => void;
  returnTo?: string | null;
}

export default function SurveyContainer({
  survey,
  tenantSlug,
  couponId,
  email,
  onQuestionChange,
  onDemoSubmit,
  returnTo,
}: SurveyContainerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitIntentRef = useRef(false);

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
      } else if (returnTo === "coupons" && email) {
        // Sign-in flow with no survey questions - go to coupons
        window.location.href = `/${tenantSlug}/coupons?email=${encodeURIComponent(email)}`;
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
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      onQuestionChange?.(newIndex);
    }
  };

  const handleNext = () => {
    // Check if current question has an answer
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
      setError("Please answer this question or skip it to continue");
      return;
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      onQuestionChange?.(newIndex);
      setError(null);
    }
  };

  const handleSkipClick = () => {
    setError(null);

    // Mark question as skipped by setting a null answer
    // This ensures the question is tracked but not answered
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: {
        question_id: currentQuestion.id,
        answer_text: null,
        answer_number: null,
        answer_boolean: null,
      },
    };
    setAnswers(updatedAnswers);

    if (currentQuestionIndex === survey.questions.length - 1) {
      submitIntentRef.current = true;
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      handleSubmit(syntheticEvent, updatedAnswers);
      return;
    }

    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);
    onQuestionChange?.(newIndex);
  };

  /**
   * Handles survey form submission
   *
   * Flow:
   * 1. Ensures all questions have entries (answered or skipped)
   * 2. Submits answers to survey_responses table (skipped questions have null values)
   * 3. submitSurveyAnswers stores email in email_opt_ins table (if provided)
   * 4. Redirects based on context:
   *    - couponId: redirect to coupon completion
   *    - returnTo=coupons: redirect to coupons list (sign-in flow)
   *    - else: redirect to survey completion (anonymous poll)
   */
  const handleSubmit = async (e: React.FormEvent, providedAnswers?: Record<string, QuestionAnswer>) => {
    e.preventDefault();
    if (!submitIntentRef.current) {
      return;
    }
    submitIntentRef.current = false;

    // Use provided answers if available (from handleSkip), otherwise use state
    const baseAnswers = providedAnswers || answers;

    // Ensure all questions have entries (answered or skipped)
    // Create entries for any questions that don't have answers yet
    const allAnswers = { ...baseAnswers };
    survey.questions.forEach((q) => {
      if (!allAnswers[q.id]) {
        // Question not answered or skipped - mark as skipped
        allAnswers[q.id] = {
          question_id: q.id,
          answer_text: null,
          answer_number: null,
          answer_boolean: null,
        };
      }
    });

    // Check if current question has an answer
    // Only validate this if user clicked Submit directly (not from skip modal)
    // If providedAnswers is passed, it means we're submitting from skip, so skip this check
    if (!providedAnswers) {
      const currentAnswer = allAnswers[currentQuestion.id];
      let currentQuestionAnswered = false;
      
      if (currentAnswer) {
        if (currentQuestion.type === "multiple_choice" && currentAnswer.answer_text) {
          try {
            const parsed = JSON.parse(currentAnswer.answer_text);
            currentQuestionAnswered = Array.isArray(parsed) && parsed.length > 0;
          } catch {
            currentQuestionAnswered = false;
          }
        } else {
          currentQuestionAnswered =
            (currentAnswer.answer_text !== null && currentAnswer.answer_text !== "") ||
            (currentAnswer.answer_number !== null) ||
            (currentAnswer.answer_boolean !== null);
        }
      }

      if (
        !currentQuestionAnswered &&
        currentQuestionIndex < survey.questions.length - 1
      ) {
        return;
      }
    }

    // Validate that at least one question has a real answer (not all skipped)
    // Only check this if user clicked Submit directly (not from skip modal)
    // If providedAnswers is passed, it means we're submitting from skip, so allow submission even if all skipped
    if (!providedAnswers) {
      const hasAtLeastOneAnswer = survey.questions.some((q) => {
        const answer = allAnswers[q.id];
        if (!answer) return false;

        // Check if answer has any value
        if (q.type === "multiple_choice" && answer.answer_text) {
          try {
            const parsed = JSON.parse(answer.answer_text);
            return Array.isArray(parsed) && parsed.length > 0;
          } catch {
            return false;
          }
        }

        return (
          (answer.answer_text !== null && answer.answer_text !== "") ||
          (answer.answer_number !== null) ||
          (answer.answer_boolean !== null)
        );
      });

      if (!hasAtLeastOneAnswer) {
        setError("Please answer at least one question before submitting");
        return;
      }
    }

    // Update answers state to include all questions
    setAnswers(allAnswers);
    // Demo mode: skip actual submission
    if (onDemoSubmit) {
      onDemoSubmit();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submission = {
        survey_id: survey.tenant_id, // Use tenant_id as survey identifier since no surveys table
        coupon_id: couponId,
        email: email || null,
        answers: Object.values(allAnswers),
      };

      const result = await submitSurveyAnswers(tenantSlug, submission);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        // Redirect to completion page using window.location to preserve theme
        // Full navigation to apply theme from localStorage
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

  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (target && target.tagName === "TEXTAREA") return;
    if (target && target.tagName === "INPUT" && target.type !== "submit") {
      event.preventDefault();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="flex h-full flex-col min-h-0"
    >
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

      {/* Calculate if Next/Submit should be disabled */}
      {(() => {
        const answer = answers[currentQuestion.id];
        
        // If no answer yet, disable Next/Submit
        if (!answer) {
          const canSkip = currentQuestionIndex < survey.questions.length - 1;

          return (
            <SurveyNavigation
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={survey.questions.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSkip={canSkip ? handleSkipClick : undefined}
            onSubmitClick={() => {
              submitIntentRef.current = true;
            }}
              isNextDisabled={currentQuestionIndex < survey.questions.length - 1}
              isSubmitting={isSubmitting}
            />
          );
        }

        // Check if answer has any value (answered vs skipped)
        let hasValue = false;
        if (currentQuestion.type === "multiple_choice" && answer.answer_text) {
          try {
            const parsed = JSON.parse(answer.answer_text);
            hasValue = Array.isArray(parsed) && parsed.length > 0;
          } catch {
            hasValue = false;
          }
        } else {
          hasValue =
            (answer.answer_text !== null && answer.answer_text !== "") ||
            (answer.answer_number !== null) ||
            (answer.answer_boolean !== null);
        }

        // Disable Next/Submit if not answered
        const isNextDisabled = !hasValue && currentQuestionIndex < survey.questions.length - 1;

        const canSkip = currentQuestionIndex < survey.questions.length - 1;

        return (
          <SurveyNavigation
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={survey.questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSkip={canSkip ? handleSkipClick : undefined}
            onSubmitClick={() => {
              submitIntentRef.current = true;
            }}
            isNextDisabled={isNextDisabled}
            isSubmitting={isSubmitting}
          />
        );
      })()}
    </form>
  );
}
