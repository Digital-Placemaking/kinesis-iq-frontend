/**
 * Edit survey modal — wired to updateSurvey.
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { updateSurvey } from "@/app/actions";
import type { SurveyRecord } from "@/lib/types";
import SurveyFormFields from "./SurveyFormFields";
import {
  buildSurveySettings,
  fromDatetimeLocalValue,
  surveyToFormValues,
  type SurveyFormValues,
} from "./survey-form-utils";

interface EditSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  survey: SurveyRecord | null;
}

export default function EditSurveyModal({
  isOpen,
  onClose,
  tenantSlug,
  survey,
}: EditSurveyModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<SurveyFormValues | null>(null);

  useEffect(() => {
    if (isOpen && survey) {
      setValues(surveyToFormValues(survey));
      setError(null);
    }
  }, [isOpen, survey]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !values) return;

    setError(null);

    if (!values.title.trim()) {
      setError("Title is required");
      return;
    }

    startTransition(async () => {
      const result = await updateSurvey(tenantSlug, survey.id, {
        title: values.title.trim(),
        slug: values.slug.trim() || null,
        description: values.description.trim() || null,
        kind: values.kind,
        status: values.status,
        settings: buildSurveySettings(values.allowAnonymous),
        starts_at: fromDatetimeLocalValue(values.startsAt),
        ends_at: fromDatetimeLocalValue(values.endsAt),
      });

      if (result.success) {
        router.refresh();
        handleClose();
      } else {
        setError(result.error || "Failed to update survey");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Survey" size="lg">
      {!values ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <SurveyFormFields
            values={values}
            onChange={setValues}
            disabled={isPending}
          />

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
