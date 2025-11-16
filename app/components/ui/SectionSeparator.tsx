/**
 * SectionSeparator Component
 * Modern separator using shadcn Separator component
 * Displays a horizontal separator line with centered text label
 */

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SectionSeparatorProps {
  text: string;
  className?: string;
}

export default function SectionSeparator({
  text,
  className = "",
}: SectionSeparatorProps) {
  return (
    <div className={cn("relative flex items-center gap-4", className)}>
      <Separator className="flex-1" />
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {text}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
