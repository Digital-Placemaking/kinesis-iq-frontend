import type { HydratedSurveyItem } from "@/lib/types";
import { arrayMove } from "@dnd-kit/sortable";

/** Normalize order_index after a local reorder. */
export function withNormalizedOrder(
  items: HydratedSurveyItem[]
): HydratedSurveyItem[] {
  return items.map((item, orderIndex) => ({
    ...item,
    order_index: orderIndex,
  }));
}

/** Swap two adjacent items and normalize order_index for display. */
export function reorderItemsLocally(
  items: HydratedSurveyItem[],
  itemId: string,
  direction: "up" | "down"
): HydratedSurveyItem[] | null {
  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) return null;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return null;

  const next = [...items];
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];

  return withNormalizedOrder(next);
}

/** Reorder items after a drag-and-drop move (active → over). */
export function moveSurveyItemsByDrag(
  items: HydratedSurveyItem[],
  activeId: string,
  overId: string
): HydratedSurveyItem[] | null {
  const oldIndex = items.findIndex((item) => item.id === activeId);
  const newIndex = items.findIndex((item) => item.id === overId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;

  return withNormalizedOrder(arrayMove(items, oldIndex, newIndex));
}

/** Serialize reorder mutations per survey so rapid clicks don't race on the server. */
export function createSurveyReorderQueue() {
  const chains = new Map<string, Promise<void>>();

  return function enqueue(
    surveyId: string,
    operation: () => Promise<{ success: boolean; error: string | null }>,
    onFailure: (error: string) => void
  ): void {
    const previous = chains.get(surveyId) ?? Promise.resolve();
    const next = previous
      .catch(() => {})
      .then(async () => {
        const result = await operation();
        if (!result.success) {
          onFailure(result.error || "Failed to reorder question");
        }
      });

    chains.set(surveyId, next);
  };
}
