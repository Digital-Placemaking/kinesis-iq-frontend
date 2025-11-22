/**
 * app/components/ui/Card.tsx
 * Card component wrapper.
 * Wrapper around shadcn Card for backward compatibility with variant prop support.
 */

import {
  Card as ShadcnCard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated";
}

export default function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <ShadcnCard
      className={cn(variant === "elevated" && "shadow-sm", className)}
    >
      {children}
    </ShadcnCard>
  );
}

// Re-export shadcn card components for advanced usage
export { CardContent, CardHeader, CardTitle, CardDescription, CardFooter };
