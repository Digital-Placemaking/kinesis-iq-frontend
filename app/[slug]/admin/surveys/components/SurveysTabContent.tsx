/**
 * Surveys tab — collapsible list with create/edit survey and add-question modals.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { setSurveyItemsOrder } from "@/app/actions";
import type { HydratedSurveyItem, SurveyListEntry, SurveyRecord } from "@/lib/types";
import ActionButton from "@/app/components/ui/ActionButton";
import SurveyCollapsible from "./SurveyCollapsible";
import AddSurveyModal from "./AddSurveyModal";
import EditSurveyModal from "./EditSurveyModal";
import AddQuestionToSurveyModal from "./AddQuestionToSurveyModal";
import {
  createSurveyReorderQueue,
  reorderItemsLocally,
} from "./survey-item-utils";

const QUESTION_TYPE_NAMES: Record<string, string> = {
  sentiment: "Sentiment Question",
  multiple_choice: "Multiple Choice",
  single_choice: "Single Choice",
  ranked_choice: "Ranked Choice",
  likert_5: "Likert Scale (5)",
  likert_7: "Likert Scale (7)",
  nps: "NPS",
  rating_5: "Rating (5)",
  yes_no: "Yes/No",
  open_text: "Open Text",
  numeric: "Numeric",
  slider: "Slider",
  date: "Date",
  time: "Time",
};

interface SurveysTabContentProps {
  tenantSlug: string;
  surveyEntries: SurveyListEntry[];
}

function getDefaultExpandedSurveyId(entries: SurveyListEntry[]): string | null {
  if (entries.length === 0) return null;
  const active = entries.find((entry) => entry.survey.status === "active");
  return active?.survey.id ?? entries[0].survey.id;
}

export default function SurveysTabContent({
  tenantSlug,
  surveyEntries,
}: SurveysTabContentProps) {
  const router = useRouter();
  const reorderQueueRef = useRef(createSurveyReorderQueue());
  const [entries, setEntries] = useState(surveyEntries);
  const [reorderError, setReorderError] = useState<string | null>(null);

  useEffect(() => {
    setEntries(surveyEntries);
  }, [surveyEntries]);

  const defaultExpandedId = useMemo(
    () => getDefaultExpandedSurveyId(entries),
    [entries]
  );

  const [isAddSurveyOpen, setIsAddSurveyOpen] = useState(false);
  const [editSurvey, setEditSurvey] = useState<SurveyRecord | null>(null);
  const [addQuestionEntry, setAddQuestionEntry] =
    useState<SurveyListEntry | null>(null);

  const persistItemsOrder = useCallback(
    (surveyId: string, items: HydratedSurveyItem[]) => {
      const itemIds = items.map((item) => item.id);
      reorderQueueRef.current(
        surveyId,
        () => setSurveyItemsOrder(tenantSlug, surveyId, itemIds),
        (error) => {
          setReorderError(error);
          router.refresh();
        }
      );
    },
    [tenantSlug, router]
  );

  const handleItemsOrderChange = useCallback(
    (surveyId: string, items: HydratedSurveyItem[]) => {
      setReorderError(null);
      setEntries((current) =>
        current.map((entry) =>
          entry.survey.id === surveyId ? { ...entry, items } : entry
        )
      );
      persistItemsOrder(surveyId, items);
    },
    [persistItemsOrder]
  );

  const handleReorderItem = useCallback(
    (surveyId: string, itemId: string, direction: "up" | "down") => {
      setReorderError(null);

      let nextItems: HydratedSurveyItem[] | null = null;
      setEntries((current) =>
        current.map((entry) => {
          if (entry.survey.id !== surveyId) return entry;

          const reordered = reorderItemsLocally(entry.items, itemId, direction);
          if (!reordered) return entry;

          nextItems = reordered;
          return { ...entry, items: reordered };
        })
      );

      if (!nextItems) return;

      persistItemsOrder(surveyId, nextItems);
    },
    [persistItemsOrder]
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
              Surveys
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Manage survey collections and their questions
            </p>
          </div>
          <ActionButton
            icon={Plus}
            onClick={() => setIsAddSurveyOpen(true)}
            className="w-full sm:w-auto"
          >
            Add Survey
          </ActionButton>
        </div>

        {reorderError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {reorderError}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No surveys yet
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Create your first survey to start collecting responses.
            </p>
            <div className="mt-4">
              <ActionButton icon={Plus} onClick={() => setIsAddSurveyOpen(true)}>
                Add Survey
              </ActionButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <SurveyCollapsible
                key={entry.survey.id}
                entry={entry}
                tenantSlug={tenantSlug}
                defaultExpanded={entry.survey.id === defaultExpandedId}
                questionTypeNames={QUESTION_TYPE_NAMES}
                onEdit={() => setEditSurvey(entry.survey)}
                onAddQuestion={() => setAddQuestionEntry(entry)}
                onItemsOrderChange={(items) =>
                  handleItemsOrderChange(entry.survey.id, items)
                }
                onReorderItem={(itemId, direction) =>
                  handleReorderItem(entry.survey.id, itemId, direction)
                }
              />
            ))}
          </div>
        )}
      </div>

      <AddSurveyModal
        isOpen={isAddSurveyOpen}
        onClose={() => setIsAddSurveyOpen(false)}
        tenantSlug={tenantSlug}
      />

      <EditSurveyModal
        isOpen={editSurvey !== null}
        onClose={() => setEditSurvey(null)}
        tenantSlug={tenantSlug}
        survey={editSurvey}
      />

      {addQuestionEntry && (
        <AddQuestionToSurveyModal
          isOpen={addQuestionEntry !== null}
          onClose={() => setAddQuestionEntry(null)}
          tenantSlug={tenantSlug}
          surveyId={addQuestionEntry.survey.id}
          surveyTitle={addQuestionEntry.survey.title}
          surveyKind={addQuestionEntry.survey.kind}
          surveyItems={addQuestionEntry.items}
        />
      )}
    </>
  );
}
