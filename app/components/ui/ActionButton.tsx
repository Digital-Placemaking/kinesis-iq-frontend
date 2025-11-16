/**
 * ActionButton Component
 * Wrapper around shadcn Button for backward compatibility
 * Maps old variants to new shadcn button variants
 */

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function ActionButton({
  icon: Icon,
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
}: ActionButtonProps) {
  // Map old variants to shadcn variants
  const shadcnVariant =
    variant === "primary"
      ? "default"
      : variant === "secondary"
      ? "secondary"
      : "outline";

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={shadcnVariant}
      className={cn("w-full sm:w-auto", className)}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
}
