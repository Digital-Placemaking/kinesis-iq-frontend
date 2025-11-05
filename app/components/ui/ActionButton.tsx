/**
 * Primary action button component
 * Consistent styling for main action buttons
 */
import { LucideIcon } from "lucide-react";

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
  const baseClasses =
    "flex w-full max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 whitespace-normal break-words text-center";

  const variantClasses = {
    primary: "bg-blue-600 text-white",
    secondary:
      "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
    outline:
      "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
