"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Survey, QuestionAnswer } from "@/lib/types/survey";
import { submitSurveyAnswers } from "@/app/actions";
import QuestionCard from "./QuestionCard";
import SurveyProgress from "./SurveyProgress";
import SurveyNavigation from "./SurveyNavigation";

interface SurveyContainerProps {
  survey: Survey;
  tenantSlug: string;
  couponId: string;
  email?: string;
}

export default function SurveyContainer({
  survey,
  tenantSlug,
  couponId,
  email,
}: SurveyContainerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = survey.questions[currentQuestionIndex];
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
    if (
      !answer ||
      (!answer.answer_text &&
        !answer.answer_number &&
        answer.answer_boolean === null)
    ) {
      setError("Please answer this question");
      return;
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all questions have answers
    // Since schema doesn't have required field, we'll require all questions
    const missingAnswers = survey.questions.filter(
      (q) =>
        !answers[q.id] ||
        (!answers[q.id].answer_text &&
          !answers[q.id].answer_number &&
          answers[q.id].answer_boolean === null)
    );

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
        const redirectUrl = `/${tenantSlug}/coupons/${couponId}/completed?email=${encodeURIComponent(
          email || ""
        )}`;
        if (typeof window !== "undefined") {
          window.location.href = redirectUrl;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  // This should never happen since we redirect in the page component if there are no questions
  // But keeping as a safety check
  if (survey.questions.length === 0) {
    // Redirect to completion page
    if (typeof window !== "undefined") {
      window.location.href = `/${tenantSlug}/coupons/${couponId}/completed?email=${encodeURIComponent(
        email || ""
      )}`;
    }
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <SurveyProgress
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={survey.questions.length}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <QuestionCard
        question={currentQuestion}
        answer={currentAnswer}
        onChange={handleAnswerChange}
      />

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
    </form>
  );
}
