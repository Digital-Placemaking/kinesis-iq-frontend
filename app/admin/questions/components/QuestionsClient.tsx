/**
 * Client component wrapper for questions page
 * Handles modal state and interactions
 */
"use client";

import { useState } from "react";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import QuestionActions from "./QuestionActions";
import AddQuestionModal from "./AddQuestionModal";
import { Plus } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
  order_index: number;
  is_active?: boolean;
}

interface QuestionsClientProps {
  questions: Question[];
  tenantSlug: string;
  questionTypeNames: Record<string, string>;
}

export default function QuestionsClient({
  questions,
  tenantSlug,
  questionTypeNames,
}: QuestionsClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
              Survey Questions
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Design and manage the questions shown to community members
            </p>
          </div>
          <div className="shrink-0">
            <ActionButton icon={Plus} onClick={() => setIsAddModalOpen(true)}>
              Add Question
            </ActionButton>
          </div>
        </div>

        {/* Questions List */}
        {questions && questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((question, index) => {
              const typeName =
                questionTypeNames[question.type] || question.type;
              const isActive = question.is_active ?? true;

              return (
                <Card
                  key={question.id}
                  className="p-4 sm:p-5"
                  variant="elevated"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2 sm:mb-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {typeName}
                        </span>
                        {!isActive && (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            Inactive
                          </span>
                        )}
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">
                          Order: {question.order_index}
                        </span>
                      </div>
                      <p className="break-words text-sm font-medium leading-relaxed text-black dark:text-zinc-50 sm:text-base">
                        {question.question}
                      </p>
                    </div>
                    <div className="shrink-0 self-end sm:self-auto">
                      <QuestionActions
                        tenantSlug={tenantSlug}
                        questionId={question.id}
                        questionIndex={index}
                        totalQuestions={questions.length}
                        isActive={isActive}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center" variant="elevated">
            <p className="text-zinc-600 dark:text-zinc-400">
              No questions yet. Create your first question to get started.
            </p>
          </Card>
        )}
      </div>

      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tenantSlug={tenantSlug}
      />
    </>
  );
}
