"use client";

import { useState, useTransition } from "react";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { sendMassEmail } from "@/app/actions";

interface SendEmailFormProps {
  tenantSlug: string;
}

export default function SendEmailForm({ tenantSlug }: SendEmailFormProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required");
      return;
    }

    startTransition(async () => {
      const res = await sendMassEmail(tenantSlug, subject.trim(), body.trim());
      if (res.success) {
        setResult(`Queued ${res.sent} recipients.`);
      } else {
        setError(res.error || "Failed to send mass email");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full max-w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          placeholder="e.g., Special offer for our community"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Message
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full max-w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 whitespace-pre-wrap break-words"
          placeholder="Write your announcement or promotion..."
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          This will be sent to all email addresses that opted in for your
          tenant.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {result && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {result}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <ActionButton
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Sending...
            </span>
          ) : (
            "Send Email"
          )}
        </ActionButton>
      </div>
    </form>
  );
}
