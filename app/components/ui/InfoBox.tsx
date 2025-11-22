/**
 * app/components/ui/InfoBox.tsx
 * Information box component.
 * Displays colored information boxes with optional title and content using shadcn Alert.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoBoxProps {
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
  className?: string;
}

export default function InfoBox({
  title,
  children,
  variant = "info",
  className = "",
}: InfoBoxProps) {
  const variantConfig = {
    info: {
      icon: Info,
      variant: undefined as "default" | "destructive" | undefined,
      className:
        "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
    },
    warning: {
      icon: AlertTriangle,
      variant: "destructive" as const,
      className:
        "border-destructive/50 bg-destructive/10 dark:border-destructive/50 dark:bg-destructive/20",
    },
    success: {
      icon: CheckCircle2,
      variant: undefined as "default" | "destructive" | undefined,
      className:
        "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className={cn(config.className, className)}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
