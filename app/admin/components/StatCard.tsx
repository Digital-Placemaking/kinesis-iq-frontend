/**
 * Statistic card component for admin dashboard
 * Displays a metric with an icon and value
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
    <Card className="p-6" variant="elevated">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-black dark:text-zinc-50">
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${iconBgColor}`}>{icon}</div>
      </div>
    </Card>
  );
}
