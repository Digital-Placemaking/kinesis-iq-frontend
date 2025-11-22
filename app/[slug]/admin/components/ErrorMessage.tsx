/**
 * app/admin/components/ErrorMessage.tsx
 * Error message component.
 * Displays error messages with consistent styling and icon.
 */
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
