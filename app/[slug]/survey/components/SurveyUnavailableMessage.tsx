/**
 * Empty / closed / not-yet-open states for a public survey or poll.
 */

import Link from "next/link";
import { CalendarClock, Clock, Lock, Ban } from "lucide-react";
import Card from "@/app/components/ui/Card";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import { getTenantPath } from "@/lib/utils/subdomain";
import type { TenantDisplay } from "@/lib/types/tenant";
import type { PublicSurveyUnavailableReason } from "@/lib/types/survey";

interface SurveyUnavailableMessageProps {
  tenant: TenantDisplay;
  reason: PublicSurveyUnavailableReason;
  title?: string;
}

const COPY: Record<
  Exclude<PublicSurveyUnavailableReason, "email_required">,
  {
    heading: string;
    body: string;
    icon: typeof Clock;
  }
> = {
  not_found: {
    heading: "Survey not found",
    body: "This survey or poll is not available. It may have been moved or is no longer public.",
    icon: Ban,
  },
  inactive: {
    heading: "This survey is closed",
    body: "Thanks for your interest — this survey is no longer collecting responses.",
    icon: Ban,
  },
  not_started: {
    heading: "Coming soon",
    body: "This survey has not opened yet. Please check back shortly.",
    icon: CalendarClock,
  },
  ended: {
    heading: "This survey has ended",
    body: "The response window is over. Thank you for wanting to share your voice.",
    icon: Clock,
  },
  no_questions: {
    heading: "Survey coming soon",
    body: "We're still setting up questions for this survey. Please check back soon.",
    icon: Clock,
  },
};

export default function SurveyUnavailableMessage({
  tenant,
  reason,
  title,
}: SurveyUnavailableMessageProps) {
  const copy = COPY[reason === "email_required" ? "not_found" : reason];
  const Icon = reason === "email_required" ? Lock : copy.icon;

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
              <Icon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
            </div>
          </div>

          <h1 className="mb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title || copy.heading}
          </h1>
          <p className="mb-6 text-xs text-muted-foreground sm:text-sm">
            {copy.body}
          </p>

          <Link
            href={getTenantPath(tenant.slug, "/survey")}
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-250 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            See open surveys
          </Link>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
