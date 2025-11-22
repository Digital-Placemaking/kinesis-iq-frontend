/**
 * app/[slug]/survey/components/NoSurveyMessage.tsx
 * No survey message component.
 * Displays a "coming soon" message when there are no survey questions available.
 */

import Card from "@/app/components/ui/Card";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import type { TenantDisplay } from "@/lib/types/tenant";
import { Clock } from "lucide-react";

interface NoSurveyMessageProps {
  tenant: TenantDisplay;
}

export default function NoSurveyMessage({ tenant }: NoSurveyMessageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-12">
        <Card
          className="mb-4 w-full p-4 text-center sm:mb-6 sm:p-6"
          variant="elevated"
        >
          {/* Logo */}
          <div className="mb-4 flex justify-center sm:mb-6">
            <TenantLogo tenant={tenant} size="md" />
          </div>

          {/* Clock Icon */}
          <div className="mb-4 flex justify-center sm:mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 sm:h-20 sm:w-20">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 sm:h-10 sm:w-10" />
            </div>
          </div>

          <h1 className="mb-2 text-xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-2xl md:text-3xl">
            Survey Coming Soon
          </h1>

          <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400 sm:mb-6 sm:text-sm">
            We're currently setting up our feedback survey. Please check back
            soon!
          </p>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50 sm:p-4">
            <p className="text-xs text-zinc-700 dark:text-zinc-300 sm:text-sm">
              Thank you for your interest. We'll have a survey available
              shortly.
            </p>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
