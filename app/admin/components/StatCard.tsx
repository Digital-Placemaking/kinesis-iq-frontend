/**
 * app/admin/components/StatCard.tsx
 * Statistic card component.
 * Displays a metric with an icon and value for the admin dashboard.
 */
import Card from "@/app/components/ui/Card";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-blue-100 dark:bg-blue-900/20",
}: StatCardProps) {
  return (
    <Card className="p-4 sm:p-6" variant="elevated">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-black dark:text-zinc-50">
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-2 sm:p-3 shrink-0 ml-2 ${iconBgColor}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
