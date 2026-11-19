"use client";

import { useFormStatus } from "react-dom";

export function RetrySnapshotButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="font-semibold underline disabled:opacity-60">
      {pending ? "Retrying…" : "Retry loading"}
    </button>
  );
}
