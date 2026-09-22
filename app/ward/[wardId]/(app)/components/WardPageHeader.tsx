import { wardSubtitle, type Ward } from "@/lib/councillor/wards";

/** Title + "Ward N · Name · window · year" line shared by the top-level ward screens. */
export function WardPageHeader({
  ward,
  title,
  recentMonths,
  recentYear,
}: {
  ward: Ward;
  title: string;
  recentMonths?: number;
  recentYear?: number;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500">
        {wardSubtitle(ward, recentMonths && `last ${recentMonths} months`, recentYear)}
      </p>
    </div>
  );
}
