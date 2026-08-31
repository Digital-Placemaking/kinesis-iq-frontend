/**
 * lib/survey/aggregate-question-results.ts
 *
 * Pure aggregation for question result stats. Shared by getQuestionResults
 * (all responses or filtered by survey_id) and admin reporting UI.
 */

import type { QuestionResult } from "@/lib/types/question";
import type { SurveyAnswer } from "@/lib/types/survey-answer";

export interface QuestionForAggregation {
  question: string;
  type: string;
  options?: unknown[] | null;
}

export type ResponseAnswerRow = { answer: SurveyAnswer | null };

export function aggregateQuestionResults(
  question: QuestionForAggregation,
  responses: ResponseAnswerRow[]
): QuestionResult {
  const totalResponses = responses.length;
  const questionType = question.type;
  const options = Array.isArray(question.options)
    ? (question.options as string[])
    : [];

  if (totalResponses === 0) {
    return {
      totalResponses: 0,
      questionType,
      questionText: question.question,
      options,
    };
  }

  if (
    questionType === "multiple_choice" ||
    questionType === "single_choice" ||
    questionType === "ranked_choice"
  ) {
    const choiceCounts: Record<string, number> = {};

    responses.forEach((response) => {
      const answer = response.answer;
      if (answer && typeof answer === "object") {
        if ("array" in answer && Array.isArray(answer.array)) {
          answer.array.forEach((option: string) => {
            choiceCounts[option] = (choiceCounts[option] || 0) + 1;
          });
        } else if ("text" in answer && typeof answer.text === "string") {
          choiceCounts[answer.text] = (choiceCounts[answer.text] || 0) + 1;
        }
      }
    });

    return {
      totalResponses,
      questionType,
      questionText: question.question,
      options,
      choiceCounts,
    };
  }

  if (questionType === "yes_no") {
    let yesCount = 0;
    let noCount = 0;

    responses.forEach((response) => {
      const answer = response.answer;
      if (answer && typeof answer === "object" && "boolean" in answer) {
        if (answer.boolean === true) yesCount++;
        else if (answer.boolean === false) noCount++;
      }
    });

    return {
      totalResponses,
      questionType,
      questionText: question.question,
      booleanCounts: { yes: yesCount, no: noCount },
    };
  }

  if (
    questionType === "nps" ||
    questionType === "likert_5" ||
    questionType === "likert_7" ||
    questionType === "rating_5" ||
    questionType === "numeric" ||
    questionType === "slider" ||
    questionType === "sentiment"
  ) {
    const numbers: number[] = [];
    const distribution: Record<number, number> = {};

    responses.forEach((response) => {
      const answer = response.answer;
      if (
        answer &&
        typeof answer === "object" &&
        "number" in answer &&
        answer.number !== undefined &&
        answer.number !== null
      ) {
        const num = Number(answer.number);
        numbers.push(num);
        distribution[num] = (distribution[num] || 0) + 1;
      }
    });

    if (numbers.length === 0) {
      return {
        totalResponses,
        questionType,
        questionText: question.question,
        numericStats: {
          min: 0,
          max: 0,
          mean: 0,
          median: 0,
          distribution: {},
        },
      };
    }

    numbers.sort((a, b) => a - b);
    const min = numbers[0];
    const max = numbers[numbers.length - 1];
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const median =
      numbers.length % 2 === 0
        ? (numbers[numbers.length / 2 - 1] + numbers[numbers.length / 2]) / 2
        : numbers[Math.floor(numbers.length / 2)];

    return {
      totalResponses,
      questionType,
      questionText: question.question,
      numericStats: {
        min,
        max,
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        distribution,
      },
    };
  }

  if (questionType === "open_text") {
    const textResponses: string[] = [];

    responses.forEach((response) => {
      const answer = response.answer;
      if (
        answer &&
        typeof answer === "object" &&
        "text" in answer &&
        answer.text &&
        typeof answer.text === "string" &&
        answer.text.trim()
      ) {
        textResponses.push(answer.text);
      }
    });

    return {
      totalResponses,
      questionType,
      questionText: question.question,
      textResponses,
    };
  }

  if (questionType === "date") {
    const dateCounts: Record<string, number> = {};

    responses.forEach((response) => {
      const answer = response.answer;
      if (
        answer &&
        typeof answer === "object" &&
        "text" in answer &&
        answer.text &&
        typeof answer.text === "string"
      ) {
        const date = answer.text.split("T")[0];
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      }
    });

    return {
      totalResponses,
      questionType,
      questionText: question.question,
      dateCounts,
    };
  }

  if (questionType === "time") {
    const timeCounts: Record<string, number> = {};

    responses.forEach((response) => {
      const answer = response.answer;
      if (
        answer &&
        typeof answer === "object" &&
        "text" in answer &&
        answer.text &&
        typeof answer.text === "string"
      ) {
        timeCounts[answer.text] = (timeCounts[answer.text] || 0) + 1;
      }
    });

    return {
      totalResponses,
      questionType,
      questionText: question.question,
      timeCounts,
    };
  }

  return {
    totalResponses,
    questionType,
    questionText: question.question,
  };
}
