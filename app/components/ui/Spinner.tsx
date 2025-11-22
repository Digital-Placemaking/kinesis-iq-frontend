/**
 * app/components/ui/Spinner.tsx
 * Loading spinner component.
 * Modern loading spinner using Lucide Loader2 icon with size customization.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
    />
  );
}
