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
    <div className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-12">
        <Card
          className="mb-4 w-full p-4 text-center sm:mb-6 sm:p-6"
          variant="elevated"
        >
          <div className="mb-4 flex justify-center sm:mb-6">
            <TenantLogo tenant={tenant} size="md" />
          </div>

          <div className="mb-4 flex justify-center sm:mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 sm:h-20 sm:w-20">
              <Clock className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
            </div>
          </div>

          <h1 className="mb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
            Nothing open yet
          </h1>

          <p className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
            There are no live surveys or polls right now. Please check back
            soon!
          </p>

          <div className="rounded-lg border-2 border-border bg-card p-3 sm:p-4">
            <p className="text-xs text-foreground sm:text-sm">
              Thank you for your interest. We&apos;ll have a survey available
              shortly.
            </p>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
