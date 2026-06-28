/**
 * Shared survey fields for create/edit modals.
 */

"use client";

import type { SurveyFormValues } from "./survey-form-utils";

interface SurveyFormFieldsProps {
  values: SurveyFormValues;
  onChange: (values: SurveyFormValues) => void;
  disabled?: boolean;
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500";

const labelClassName =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function SurveyFormFields({
  values,
  onChange,
  disabled = false,
}: SurveyFormFieldsProps) {
  const update = (patch: Partial<SurveyFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="survey-title" className={labelClassName}>
          Title *
        </label>
        <input
          id="survey-title"
          type="text"
          value={values.title}
          onChange={(e) => update({ title: e.target.value })}
          className={inputClassName}
          placeholder="Community feedback survey"
          required
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="survey-slug" className={labelClassName}>
          Slug
        </label>
        <input
          id="survey-slug"
          type="text"
          value={values.slug}
          onChange={(e) => update({ slug: e.target.value })}
          className={inputClassName}
          placeholder="community-feedback"
          disabled={disabled}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Optional URL-friendly identifier. Must be unique per tenant.
        </p>
      </div>

      <div>
        <label htmlFor="survey-description" className={labelClassName}>
          Description
        </label>
        <textarea
          id="survey-description"
          value={values.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          className={inputClassName}
          placeholder="Short description for staff..."
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="survey-kind" className={labelClassName}>
            Kind
          </label>
          <select
            id="survey-kind"
            value={values.kind}
            onChange={(e) =>
              update({ kind: e.target.value as SurveyFormValues["kind"] })
            }
            className={inputClassName}
            disabled={disabled}
          >
            <option value="survey">Survey</option>
            <option value="poll">Poll</option>
          </select>
        </div>

        <div>
          <label htmlFor="survey-status" className={labelClassName}>
            Status
          </label>
          <select
            id="survey-status"
            value={values.status}
            onChange={(e) =>
              update({ status: e.target.value as SurveyFormValues["status"] })
            }
            className={inputClassName}
            disabled={disabled}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="survey-starts-at" className={labelClassName}>
            Starts at
          </label>
          <input
            id="survey-starts-at"
            type="datetime-local"
            value={values.startsAt}
            onChange={(e) => update({ startsAt: e.target.value })}
            className={inputClassName}
            disabled={disabled}
          />
        </div>

        <div>
          <label htmlFor="survey-ends-at" className={labelClassName}>
            Ends at
          </label>
          <input
            id="survey-ends-at"
            type="datetime-local"
            value={values.endsAt}
            onChange={(e) => update({ endsAt: e.target.value })}
            className={inputClassName}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="survey-allow-anonymous"
          checked={values.allowAnonymous}
          onChange={(e) => update({ allowAnonymous: e.target.checked })}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700"
          disabled={disabled}
        />
        <label
          htmlFor="survey-allow-anonymous"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Allow anonymous responses
        </label>
      </div>
    </div>
  );
}
