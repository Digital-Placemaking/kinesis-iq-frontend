/**
 * Create survey modal — wired to createSurvey.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { createSurvey } from "@/app/actions";
import SurveyFormFields from "./SurveyFormFields";
import {
  buildSurveySettings,
  emptySurveyFormValues,
  fromDatetimeLocalValue,
  type SurveyFormValues,
} from "./survey-form-utils";

interface AddSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
}

export default function AddSurveyModal({
  isOpen,
  onClose,
  tenantSlug,
}: AddSurveyModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<SurveyFormValues>(emptySurveyFormValues());

  const reset = () => {
    setValues(emptySurveyFormValues());
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.title.trim()) {
      setError("Title is required");
      return;
    }

    startTransition(async () => {
      const result = await createSurvey(tenantSlug, {
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
        setError(result.error || "Failed to create survey");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Survey" size="lg">
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
          <ActionButton type="submit" disabled={isPending} className="min-w-[100px]">
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Creating...
              </span>
            ) : (
              "Create Survey"
            )}
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
}
