/**
 * app/[slug]/admin/emails/components/SendEmailModal.tsx
 * Modal component for sending mass emails via Resend.
 */

"use client";

import { useState } from "react";
import { Send, Loader2, X } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import { sendMassEmail } from "@/app/actions/emails";

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  recipientCount: number;
}

export default function SendEmailModal({
  isOpen,
  onClose,
  tenantSlug,
  recipientCount,
}: SendEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    sent: number;
    failed: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    if (!body.trim()) {
      setError("Email body is required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendMassEmail(
        tenantSlug,
        subject.trim(),
        body.trim()
      );

      if (result.success) {
        setSuccess({
          sent: result.sent,
          failed: result.failed,
        });
        // Clear form after successful send
        setSubject("");
        setBody("");
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 3000);
      } else {
        setError(result.error || "Failed to send emails");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSubject("");
      setBody("");
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Mass Email"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Count */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>{recipientCount}</strong> email
            {recipientCount !== 1 ? "s" : ""} will receive this message.
          </p>
          {recipientCount > 50 && (
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
              <strong>Note:</strong> Emails will be sent in batches of 50
              (temporary testing restriction).
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="email-subject"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Subject *
          </label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="Enter email subject"
            required
            disabled={loading}
          />
        </div>

        {/* Body */}
        <div>
          <label
            htmlFor="email-body"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email Body (HTML) *
          </label>
          <textarea
            id="email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 font-mono"
            placeholder="Enter email body (HTML supported)"
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            HTML is supported. Use &lt;br&gt; for line breaks, &lt;p&gt; for
            paragraphs, etc.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-300">
              <strong>Success!</strong> Sent to {success.sent} email
              {success.sent !== 1 ? "s" : ""}
              {success.failed > 0 && ` (${success.failed} failed)`}.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ActionButton
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </ActionButton>
          <ActionButton type="submit" icon={Send} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Email"
            )}
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
}
