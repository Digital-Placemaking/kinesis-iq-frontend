/**
 * Quick action card component for admin dashboard
 * Displays a clickable action link with consistent styling
 */
import Card from "@/app/components/ui/Card";

interface QuickActionCardProps {
  href: string;
  label: string;
}

export default function QuickActionCard({ href, label }: QuickActionCardProps) {
  return (
    <Card className="p-4" variant="elevated">
      <a
        href={href}
        className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {label}
      </a>
    </Card>
  );
}
