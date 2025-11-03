"use client";

import type { SurveyQuestion, QuestionAnswer } from "@/lib/types/survey";
import Card from "@/app/components/ui/Card";
import QuestionInput from "@/app/components/survey/questions/QuestionInput";
import QuestionRadio from "@/app/components/survey/questions/QuestionRadio";
import QuestionRating from "@/app/components/survey/questions/QuestionRating";
import QuestionCheckbox from "@/app/components/survey/questions/QuestionCheckbox";
import QuestionNPS from "@/app/components/survey/questions/QuestionNPS";
import QuestionLikert from "@/app/components/survey/questions/QuestionLikert";
import QuestionYesNo from "@/app/components/survey/questions/QuestionYesNo";
import QuestionNumeric from "@/app/components/survey/questions/QuestionNumeric";
import QuestionSlider from "@/app/components/survey/questions/QuestionSlider";
import QuestionDate from "@/app/components/survey/questions/QuestionDate";
import QuestionTime from "@/app/components/survey/questions/QuestionTime";

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
  // Helper to parse options from JSONB format
  const parseOptions = (): string[] => {
    if (!question.options || !Array.isArray(question.options)) {
      return [];
    }
    return question.options.map((opt: any) =>
      typeof opt === "string" ? opt : opt.label || opt.value || String(opt)
    );
  };

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

  // Handle multiple choice - store as JSON string array
  const handleMultipleChoiceChange = (values: string[]) => {
    onChange({
      question_id: question.id,
      answer_text: JSON.stringify(values),
      answer_number: null,
      answer_boolean: null,
    });
  };

  const renderQuestionInput = () => {
    const options = parseOptions();

    switch (question.type) {
      // Text-based questions
      case "open_text":
        return (
          <QuestionInput
            value={answer?.answer_text || ""}
            onChange={handleTextChange}
            multiline={true}
          />
        );

      // Single selection questions
      case "single_choice":
      case "ranked_choice":
        return (
          <QuestionRadio
            value={answer?.answer_text || null}
            onChange={handleTextChange}
            options={options}
          />
        );

      // Multiple selection questions
      case "multiple_choice":
        const selectedValues = answer?.answer_text
          ? (JSON.parse(answer.answer_text) as string[])
          : [];
        return (
          <QuestionCheckbox
            value={selectedValues}
            onChange={handleMultipleChoiceChange}
            options={options}
          />
        );

      // Rating questions (1-5 scale)
      case "sentiment":
      case "rating_5":
        return (
          <QuestionRating
            value={answer?.answer_number || null}
            onChange={handleNumberChange}
            min={1}
            max={5}
          />
        );

      // Likert scale questions
      case "likert_5":
        return (
          <QuestionLikert
            value={answer?.answer_number || null}
            onChange={handleNumberChange}
            scale={5}
            labels={
              options.length >= 2
                ? { left: options[0], right: options[1] }
                : undefined
            }
          />
        );

      case "likert_7":
        return (
          <QuestionLikert
            value={answer?.answer_number || null}
            onChange={handleNumberChange}
            scale={7}
            labels={
              options.length >= 2
                ? { left: options[0], right: options[1] }
                : undefined
            }
          />
        );

      // NPS (0-10 scale)
      case "nps":
        return (
          <QuestionNPS
            value={answer?.answer_number || null}
            onChange={handleNumberChange}
          />
        );

      // Boolean questions
      case "yes_no":
        return (
          <QuestionYesNo
            value={answer?.answer_boolean ?? null}
            onChange={handleBooleanChange}
          />
        );

      // Numeric questions
      case "numeric":
        // Parse min/max from options if provided
        const min = options[0] ? parseFloat(options[0]) : undefined;
        const max = options[1] ? parseFloat(options[1]) : undefined;
        return (
          <QuestionNumeric
            value={answer?.answer_number ?? null}
            onChange={(val) => {
              if (val !== null) {
                handleNumberChange(val);
              }
            }}
            min={isNaN(min!) ? undefined : min}
            max={isNaN(max!) ? undefined : max}
          />
        );

      // Slider questions
      case "slider":
        const sliderMin = options[0] ? parseFloat(options[0]) : 0;
        const sliderMax = options[1] ? parseFloat(options[1]) : 100;
        const sliderStep = options[2] ? parseFloat(options[2]) : 1;
        return (
          <QuestionSlider
            value={answer?.answer_number ?? null}
            onChange={handleNumberChange}
            min={isNaN(sliderMin) ? 0 : sliderMin}
            max={isNaN(sliderMax) ? 100 : sliderMax}
            step={isNaN(sliderStep) ? 1 : sliderStep}
            labels={
              options.length >= 4
                ? { min: options[2], max: options[3] }
                : undefined
            }
          />
        );

      // Date/time questions
      case "date":
        const dateMin = options[0] || undefined;
        const dateMax = options[1] || undefined;
        return (
          <QuestionDate
            value={answer?.answer_text || null}
            onChange={handleTextChange}
            min={dateMin}
            max={dateMax}
          />
        );

      case "time":
        const timeMin = options[0] || undefined;
        const timeMax = options[1] || undefined;
        return (
          <QuestionTime
            value={answer?.answer_text || null}
            onChange={handleTextChange}
            min={timeMin}
            max={timeMax}
          />
        );

      // Fallback: treat as text input
      default:
        return (
          <QuestionInput
            value={answer?.answer_text || ""}
            onChange={handleTextChange}
          />
        );
    }
  };

  return (
    <Card className="p-6" variant="elevated">
      <div className="mb-4">
        <label className="block text-base font-semibold text-black dark:text-zinc-50">
          {question.question}
        </label>
      </div>
      <div className="mt-4">{renderQuestionInput()}</div>
    </Card>
  );
}
