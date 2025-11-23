/**
 * app/[slug]/admin/components/PilotAccessPanel.tsx
 * Simple button to visit the pilot
 */

"use client";

import { ExternalLink } from "lucide-react";
import ActionButton from "@/app/components/ui/ActionButton";

interface PilotAccessPanelProps {
  tenantSlug: string;
  tenantSubdomain: string | null;
  tenantWebsiteUrl: string | null;
}

export default function PilotAccessPanel({
  tenantSlug,
}: PilotAccessPanelProps) {
  const handleVisitPilot = () => {
    // Visit the slug-based URL (most reliable)
    window.open(`/${tenantSlug}`, "_blank");
  };

  return (
    <ActionButton icon={ExternalLink} onClick={handleVisitPilot}>
      Visit Pilot
    </ActionButton>
  );
}
