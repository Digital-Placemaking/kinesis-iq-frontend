/**
 * Edit per-survey item settings (required flag and optional JSON settings).
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { updateSurveyItem } from "@/app/actions";
import type { HydratedSurveyItem } from "@/lib/types";

interface EditSurveyItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  item: HydratedSurveyItem | null;
}

function settingsToJson(settings: Record<string, unknown>): string {
  if (Object.keys(settings).length === 0) {
    return "{}";
  }
  return JSON.stringify(settings, null, 2);
}

export default function EditSurveyItemModal({
  isOpen,
  onClose,
  tenantSlug,
  item,
}: EditSurveyItemModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [required, setRequired] = useState(true);
  const [settingsJson, setSettingsJson] = useState("{}");

  useEffect(() => {
    if (isOpen && item) {
      setRequired(item.required);
      setSettingsJson(settingsToJson(item.settings));
      setError(null);
    }
  }, [isOpen, item]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    let parsedSettings: Record<string, unknown>;
    try {
      const trimmed = settingsJson.trim() || "{}";
      const parsed = JSON.parse(trimmed);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setError("Settings must be a JSON object");
        return;
      }
      parsedSettings = parsed as Record<string, unknown>;
    } catch {
      setError("Settings must be valid JSON");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateSurveyItem(tenantSlug, item.id, {
        required,
        settings: parsedSettings,
      });

      if (result.success) {
        router.refresh();
        handleClose();
      } else {
        setError(result.error || "Failed to update survey item");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Survey Item Settings"
      size="md"
    >
      {!item ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Settings apply only to this survey. Question text is edited separately.
          </p>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
            {item.question.question}
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Required in this survey
            </span>
          </label>

          <div>
            <label
              htmlFor="item-settings-json"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Item settings (JSON)
            </label>
            <textarea
              id="item-settings-json"
              value={settingsJson}
              onChange={(e) => setSettingsJson(e.target.value)}
              rows={6}
              disabled={isPending}
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="{}"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Optional per-survey overrides stored on survey_items.settings.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              disabled={isPending}
            >
              Cancel
            </button>
            <ActionButton
              type="submit"
              disabled={isPending}
              className="min-w-[100px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </ActionButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
