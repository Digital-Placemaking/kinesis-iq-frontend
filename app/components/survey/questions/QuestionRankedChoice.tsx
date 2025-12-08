/**
 * app/components/survey/questions/QuestionRankedChoice.tsx
 * Ranked choice question component with drag-and-drop reordering.
 * Allows users to select multiple options and rank them in order of importance.
 */

"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface QuestionRankedChoiceProps {
  value: string[] | null;
  onChange: (value: string[]) => void;
  options: string[];
  required?: boolean;
}

function SortableRankingItem({
  id,
  option,
  rank,
}: {
  id: string;
  option: string;
  rank: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, x: 0 } : null
    ),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.8 : 1,
    touchAction: "none" as const,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5 sm:p-3 shadow-sm transition-opacity duration-200 hover:bg-muted/50 hover:shadow-md cursor-grab active:cursor-grabbing"
      aria-label={`Drag to reorder: ${option}`}
    >
      <span className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2 min-w-0 flex-1">
        <span className="flex-shrink-0 inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
          {rank}
        </span>
        <span className="truncate">{option}</span>
      </span>
      <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

export default function QuestionRankedChoice({
  value,
  onChange,
  options,
  required = false,
}: QuestionRankedChoiceProps) {
  const rankings = value || [];
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSelect = (option: string) => {
    if (rankings.includes(option)) {
      onChange(rankings.filter((r) => r !== option));
    } else {
      onChange([...rankings, option]);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const scrollContainers = document.querySelectorAll(
      "[data-onboarding-scroll]"
    );
    scrollContainers.forEach((container) => {
      (container as HTMLElement).style.overflow = "hidden";
      (container as HTMLElement).style.touchAction = "none";
    });
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    const scrollContainers = document.querySelectorAll(
      "[data-onboarding-scroll]"
    );
    scrollContainers.forEach((container) => {
      (container as HTMLElement).style.overflow = "";
      (container as HTMLElement).style.touchAction = "";
    });
    document.body.style.overflow = "";
    document.body.style.touchAction = "";

    if (over && active.id !== over.id) {
      const oldIndex = rankings.indexOf(active.id as string);
      const newIndex = rankings.indexOf(over.id as string);
      const newRankings = arrayMove(rankings, oldIndex, newIndex);
      onChange(newRankings);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-1.5">
        {options.map((option, index) => {
          const isSelected = rankings.includes(option);
          const rank = rankings.indexOf(option) + 1;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={`group w-full rounded-lg border-2 p-2.5 sm:p-3 text-left transition-all duration-250 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm sm:text-base font-semibold transition-colors truncate flex-1 ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {option}
                </span>
                {isSelected && (
                  <span className="flex-shrink-0 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                    {rank}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {rankings.length > 0 && (
        <div className="space-y-1.5 border-t border-border/50 pt-2.5 mt-2 animate-fade-in overflow-x-hidden">
          <p className="text-xs sm:text-sm font-semibold text-foreground px-1">
            Your ranking (drag to reorder):
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={rankings}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1 relative overflow-x-hidden overflow-y-hidden w-full">
                {rankings.map((option) => (
                  <SortableRankingItem
                    key={option}
                    id={option}
                    option={option}
                    rank={rankings.indexOf(option) + 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

