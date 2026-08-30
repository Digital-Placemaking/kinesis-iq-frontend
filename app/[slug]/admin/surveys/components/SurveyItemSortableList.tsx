/**
 * Drag-and-drop sortable list of survey items (admin builder).
 */

"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { HydratedSurveyItem, SurveySummary } from "@/lib/types";
import SurveyItemActions from "./SurveyItemActions";
import { moveSurveyItemsByDrag } from "./survey-item-utils";

interface SurveyItemSortableListProps {
  items: HydratedSurveyItem[];
  summary: SurveySummary;
  surveyId: string;
  surveyTitle: string;
  tenantSlug: string;
  questionTypeNames: Record<string, string>;
  onItemsOrderChange: (items: HydratedSurveyItem[]) => void;
  onReorderItem?: (itemId: string, direction: "up" | "down") => void;
}

interface SortableSurveyItemRowProps {
  item: HydratedSurveyItem;
  index: number;
  totalItems: number;
  typeName: string;
  perQuestionCount: number;
  tenantSlug: string;
  surveyId: string;
  surveyTitle: string;
  onReorderItem?: (itemId: string, direction: "up" | "down") => void;
}

function SortableSurveyItemRow({
  item,
  index,
  totalItems,
  typeName,
  perQuestionCount,
  tenantSlug,
  surveyId,
  surveyTitle,
  onReorderItem,
}: SortableSurveyItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, x: 0 } : null
    ),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 transition-colors dark:border-zinc-800 dark:bg-zinc-950/50 has-[.drag-reorder-handle:hover]:border-zinc-300 has-[.drag-reorder-handle:hover]:bg-zinc-100/90 dark:has-[.drag-reorder-handle:hover]:border-zinc-600 dark:has-[.drag-reorder-handle:hover]:bg-zinc-800/70 ${
        isDragging
          ? "border-blue-300 bg-zinc-100 shadow-sm dark:border-blue-700 dark:bg-zinc-800/90"
          : ""
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <div className="min-w-0 flex-1 sm:max-w-[50%]">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {index + 1}.
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {typeName}
            </span>
            {item.required && (
              <span className="inline-flex items-center rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-900 dark:text-zinc-50">
            {item.question.question}
          </p>
        </div>

        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="drag-reorder-handle group flex min-h-11 flex-1 touch-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 transition-colors cursor-grab active:cursor-grabbing"
          aria-label={`Drag to reorder question ${index + 1}`}
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 shrink-0 text-zinc-400 opacity-30 transition-opacity group-hover:opacity-100 dark:text-zinc-500" />
          <span className="select-none text-xs font-medium text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-400">
            Drag to reorder
          </span>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2 sm:items-end">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {perQuestionCount}{" "}
            {perQuestionCount === 1 ? "response" : "responses"}
          </span>
          <SurveyItemActions
            tenantSlug={tenantSlug}
            surveyId={surveyId}
            surveyTitle={surveyTitle}
            item={item}
            itemIndex={index}
            totalItems={totalItems}
            onReorder={
              onReorderItem
                ? (direction) => onReorderItem(item.id, direction)
                : undefined
            }
          />
        </div>
      </div>
    </li>
  );
}

export default function SurveyItemSortableList({
  items,
  summary,
  surveyId,
  surveyTitle,
  tenantSlug,
  questionTypeNames,
  onItemsOrderChange,
  onReorderItem,
}: SurveyItemSortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = moveSurveyItemsByDrag(
      items,
      String(active.id),
      String(over.id)
    );
    if (reordered) {
      onItemsOrderChange(reordered);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="space-y-3">
          {items.map((item, index) => {
            const typeName =
              questionTypeNames[item.question.type] || item.question.type;
            const perQuestionCount =
              summary.question_totals.find(
                (total) => total.question_id === item.question_id
              )?.response_count ?? 0;

            return (
              <SortableSurveyItemRow
                key={item.id}
                item={item}
                index={index}
                totalItems={items.length}
                typeName={typeName}
                perQuestionCount={perQuestionCount}
                tenantSlug={tenantSlug}
                surveyId={surveyId}
                surveyTitle={surveyTitle}
                onReorderItem={onReorderItem}
              />
            );
          })}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
