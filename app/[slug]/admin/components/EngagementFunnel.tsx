/**
 * app/[slug]/admin/components/EngagementFunnel.tsx
 * Engagement Funnel Vertical Bar Chart Component
 * Displays user journey through the experience
 */

"use client";

interface EngagementFunnelProps {
  pageVisits: number;
  surveyResponses: number;
  copyCodeClicks: number;
  downloadWallet: number;
}

export default function EngagementFunnel({
  pageVisits,
  surveyResponses,
  copyCodeClicks,
  downloadWallet,
}: EngagementFunnelProps) {
  const maxValue = Math.max(
    pageVisits,
    surveyResponses,
    copyCodeClicks,
    downloadWallet
  );

  const steps = [
    {
      label: "Page Visits",
      value: pageVisits,
      color: "bg-blue-500",
    },
    {
      label: "Survey Responses",
      value: surveyResponses,
      color: "bg-green-500",
    },
    {
      label: "Copy Code Clicks",
      value: copyCodeClicks,
      color: "bg-zinc-400",
    },
    {
      label: "Download/Wallet",
      value: downloadWallet,
      color: "bg-zinc-400",
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const percentage = maxValue > 0 ? (step.value / maxValue) * 100 : 0;

        return (
          <div key={index}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-black dark:text-zinc-50">
                {step.label}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {step.value}
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
              <div
                className={`h-full ${step.color} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
