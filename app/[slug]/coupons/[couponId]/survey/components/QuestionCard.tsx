"use client";

import type { SurveyQuestion, QuestionAnswer } from "@/lib/types/survey";
import QuestionInput from "./QuestionInput";
import QuestionRadio from "./QuestionRadio";
import QuestionRating from "./QuestionRating";

interface QuestionCardProps {
  question: SurveyQuestion;
  answer: QuestionAnswer | null;
  onChange: (answer: QuestionAnswer) => void;
}

export default function QuestionCard({
  question,
  answer,
  onChange,
}: QuestionCardProps) {
  const handleTextChange = (text: string) => {
    onChange({
      question_id: question.id,
      answer_text: text || null,
      answer_number: null,
      answer_boolean: null,
    });
  };

  const handleNumberChange = (num: number) => {
    onChange({
      question_id: question.id,
      answer_text: null,
      answer_number: num,
      answer_boolean: null,
    });
  };

  const handleBooleanChange = (bool: boolean) => {
    onChange({
      question_id: question.id,
      answer_text: null,
      answer_number: null,
      answer_boolean: bool,
    });
  };

  const handleRadioChange = (value: string) => {
    handleTextChange(value);
  };

  const renderQuestionInput = () => {
    // Map the schema types to our component types
    switch (question.type) {
      case "text":
        // Free-text input question
        return (
          <QuestionInput
            value={answer?.answer_text || ""}
            onChange={handleTextChange}
          />
        );

      case "sentiment":
        // Sentiment can be treated as a rating (1-5 scale)
        return (
          <QuestionRating
            value={answer?.answer_number || null}
            onChange={handleNumberChange}
            min={1}
            max={5}
          />
        );

      case "ranked_choice":
        // Ranked choice can be treated as radio (single selection)
        // Parse options if they're in JSONB format
        const options = Array.isArray(question.options)
          ? question.options.map((opt: any) =>
              typeof opt === "string"
                ? opt
                : opt.label || opt.value || String(opt)
            )
          : [];
        return (
          <QuestionRadio
            value={answer?.answer_text || null}
            onChange={handleRadioChange}
            options={options}
          />
        );

      // Fallback for any other types
      default:
        // If options exist, treat as radio
        if (question.options && question.options.length > 0) {
          const options = Array.isArray(question.options)
            ? question.options.map((opt: any) =>
                typeof opt === "string"
                  ? opt
                  : opt.label || opt.value || String(opt)
              )
            : [];
          return (
            <QuestionRadio
              value={answer?.answer_text || null}
              onChange={handleRadioChange}
              options={options}
            />
          );
        }
        // Otherwise treat as text input
        return (
          <QuestionInput
            value={answer?.answer_text || ""}
            onChange={handleTextChange}
          />
        );
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <label className="block text-base font-semibold text-black dark:text-zinc-50">
          {question.question}
        </label>
      </div>
      <div className="mt-4">{renderQuestionInput()}</div>
    </div>
  );
}
