import { AlertTriangle } from "lucide-react";

/**
 * Shown when a screen can't reach the councillor API. Keeps the shell intact so
 * the demo degrades gracefully instead of crashing.
 */
export function ApiErrorBanner({ detail }: { detail?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
      <div>
        <p className="font-semibold">Couldn’t load live data</p>
        <p className="mt-0.5 text-amber-700">
          The councillor API didn’t respond. {detail ? `(${detail})` : null} The
          backend may not be running yet — story and indicator data will appear
          once it’s reachable.
        </p>
      </div>
    </div>
  );
}
