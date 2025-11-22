/**
 * app/admin/components/QuickActionCard.tsx
 * Quick action card component.
 * Displays a clickable action link with consistent styling for admin dashboard.
 */
import Card from "@/app/components/ui/Card";

interface QuickActionCardProps {
  href?: string;
  label: string;
  onClick?: () => void;
}

export default function QuickActionCard({
  href,
  label,
  onClick,
}: QuickActionCardProps) {
  return (
    <Card className="p-3 sm:p-4" variant="elevated">
      {href ? (
        <a
          href={href}
          className="block cursor-pointer text-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-words"
        >
          {label}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="block w-full cursor-pointer text-center text-xs sm:text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-words"
        >
          {label}
        </button>
      )}
    </Card>
  );
}
