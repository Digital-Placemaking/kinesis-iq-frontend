/**
 * Delete confirmation modal component
 * Reusable modal for confirming destructive actions
 */
"use client";

import Modal from "./Modal";
import ActionButton from "./ActionButton";
import Spinner from "./Spinner";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-full bg-red-100 p-2 dark:bg-red-900/30">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {cancelText}
          </button>
          <ActionButton
            onClick={handleConfirm}
            disabled={isLoading}
            variant="secondary"
            className="min-w-[100px] border-red-300 bg-red-600 text-white hover:bg-red-700 dark:border-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="text-white" />
                Deleting...
              </span>
            ) : (
              confirmText
            )}
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}
