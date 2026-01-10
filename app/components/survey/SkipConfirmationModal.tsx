/**
 * app/components/survey/SkipConfirmationModal.tsx
 * Skip confirmation modal component.
 * Confirmation modal for skipping survey questions.
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface SkipConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLastQuestion: boolean;
}

export default function SkipConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLastQuestion,
}: SkipConfirmationModalProps) {
  const title = isLastQuestion
    ? "Skip and Submit Survey?"
    : "Skip This Question?";

  const message = isLastQuestion
    ? "Are you sure you want to skip this question and submit the survey? You can still go back to answer it if needed."
    : "Are you sure you want to skip this question? You can go back to answer it later.";

  const confirmText = isLastQuestion ? "Skip & Submit" : "Skip";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-start gap-4 pt-4">
              <div className="shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {message}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
