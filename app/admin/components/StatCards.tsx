/**
 * Statistics cards grid component
 * Displays all dashboard metrics in a responsive grid
 */
import StatCard from "./StatCard";
import { Gift, FileText, CheckCircle2 } from "lucide-react";

interface StatCardsProps {
  couponCount: number;
  surveyCount: number;
  issuedCouponCount: number;
}

export default function StatCards({
  couponCount,
  surveyCount,
  issuedCouponCount,
}: StatCardsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Coupons"
        value={couponCount}
        icon={<Gift className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
        iconBgColor="bg-blue-100 dark:bg-blue-900/20"
      />
      <StatCard
        title="Survey Questions"
        value={surveyCount}
        icon={
          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
        }
        iconBgColor="bg-green-100 dark:bg-green-900/20"
      />
      <StatCard
        title="Issued Coupons"
        value={issuedCouponCount}
        icon={
          <CheckCircle2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        }
        iconBgColor="bg-orange-100 dark:bg-orange-900/20"
      />
    </div>
  );
}
