// DeactivatedMessage
// Displays a message when a tenant pilot is deactivated, informing users they must contact the business owner.
// Used in: app/[slug]/page.tsx, app/[slug]/coupons/[couponId]/survey/page.tsx

import Card from "@/app/components/ui/Card";
import Footer from "@/app/components/Footer";
import { Mail, AlertCircle } from "lucide-react";

interface DeactivatedMessageProps {
  tenantName: string;
}

export default function DeactivatedMessage({
  tenantName,
}: DeactivatedMessageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8 py-12">
        <Card className="mb-6 p-8 text-center" variant="elevated">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
            Pilot Deactivated
          </h1>

          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            This pilot for <span className="font-semibold">{tenantName}</span>{" "}
            is currently deactivated and not accepting new interactions.
          </p>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 shrink-0 text-zinc-600 dark:text-zinc-400" />
              <div className="text-left">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Need to Access This Pilot?
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Please contact the business owner to reactivate this pilot or
                  for assistance.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
