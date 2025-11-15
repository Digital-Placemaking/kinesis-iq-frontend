// Card
// Reusable card container component that provides consistent styling for card-based layouts.
// Used in: Various components throughout the app for displaying content in cards.

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
  const baseClasses =
    "rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";
  const variantClasses = variant === "elevated" ? "shadow-sm" : "";

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
}
