/**
 * Quick action card component for admin dashboard
 * Displays a clickable action link with consistent styling
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
    <Card className="p-4" variant="elevated">
      {href ? (
        <a
          href={href}
          className="block cursor-pointer text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {label}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="block w-full cursor-pointer text-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {label}
        </button>
      )}
    </Card>
  );
}
