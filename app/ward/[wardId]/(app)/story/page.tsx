import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getWardView } from "@/lib/councillor/api";
import {
  byRatioDesc,
  categoryLabel,
  formatCount,
  ratioLabel,
  sharePct,
} from "@/lib/councillor/format";
import { areaHref, categoryHref } from "@/lib/councillor/drilldown";
import { resolveWard, wardMetadata, type WardParams } from "@/lib/councillor/ward-context";
import { OverviewCard, type OverviewRow } from "../components/OverviewCard";
import { wardPath } from "@/lib/councillor/wards";
import { WardPageHeader } from "../components/WardPageHeader";
import { PctBadge } from "../../components/PctBadge";
import { ApiErrorBanner } from "../../components/StateBanner";

export const generateMetadata = wardMetadata((ward) => `Ward Story · ${ward.label}`);

export default async function WardStoryPage({
  params,
}: {
  params: WardParams;
}) {
  const ward = await resolveWard(params);
  const wv = await getWardView(ward.id).catch(() => null);

  if (!wv) {
    return (
      <div className="space-y-4">
        <WardPageHeader ward={ward} title="Ward Story" />
        <ApiErrorBanner />
      </div>
    );
  }

  const rising: OverviewRow[] = wv.RISING.slice(0, 6).map((r) => ({
    id: r.category,
    href: categoryHref(ward, r.category),
    label: categoryLabel(r.category),
    sub: `${formatCount(r.recent)} vs ${formatCount(Math.round(r.baseline_avg))} baseline`,
    trailing: <PctBadge value={r.pct_change} />,
  }));

  const falling: OverviewRow[] = wv.FALLING.slice(0, 6).map((r) => ({
    id: r.category,
    href: categoryHref(ward, r.category),
    label: categoryLabel(r.category),
    sub: `${formatCount(r.recent)} vs ${formatCount(Math.round(r.baseline_avg))} baseline`,
    trailing: <PctBadge value={r.pct_change} />,
  }));

  const wardVsCity: OverviewRow[] = byRatioDesc(wv["WARD VS CITY"])
    .slice(0, 8)
    .map((w) => ({
      id: w.category,
      href: categoryHref(ward, w.category),
      label: categoryLabel(w.category),
      sub: `ward ${sharePct(w.ward7_share)} · city ${sharePct(w.city_share)}`,
      trailing: (
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {ratioLabel(w.ratio)}
        </span>
      ),
    }));

  const earlyWarning: OverviewRow[] = wv["EARLY WARNING"].map((e) => ({
    id: e.category,
    href: categoryHref(ward, e.category),
    label: categoryLabel(e.category),
    sub: `z-score ${e.z_score.toFixed(2)} · ${formatCount(e.recent)} vs ${formatCount(e.prior)} prior`,
    trailing: <PctBadge value={e.pct_change} />,
  }));

  const repeated: OverviewRow[] = wv["REPEATED COMPLAINTS"]
    .slice(0, 6)
    .map((r, i) => ({
      id: `${r.fsa}-${i}`,
      href: areaHref(ward, r.fsa),
      label: r.type,
      sub: r.fsa,
      trailing: (
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {formatCount(r.count)}
        </span>
      ),
    }));

  const drifting: OverviewRow[] = wv.DRIFTING.slice(0, 6).map((d) => ({
    id: d.category,
    href: categoryHref(ward, d.category),
    label: categoryLabel(d.category),
    sub: "positive monthly slope",
    trailing: (
      <span className="text-sm font-semibold tabular-nums text-emerald-700">
        +{d.slope.toFixed(1)}/mo
      </span>
    ),
  }));

  return (
    <div className="space-y-6">
      <WardPageHeader ward={ward} title="Ward Story" recentYear={wv.meta.recent_year} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OverviewCard
          title="Rising vs Baseline"
          hint="Categories up year-over-year"
          rows={rising}
        />
        <OverviewCard
          title="Falling"
          hint="Categories down year-over-year"
          rows={falling}
          emptyText="No categories falling this period."
        />
        <OverviewCard
          title={`${ward.label} vs City`}
          hint="Share of requests vs the citywide mix"
          rows={wardVsCity}
        />
        <OverviewCard
          title="Early Warning"
          hint="Unusual jumps vs prior years"
          rows={earlyWarning}
          emptyText="No flags this period."
        />
        <OverviewCard
          title="Repeated Complaints"
          hint="Recurring issues by micro-area"
          rows={repeated}
        />
        <OverviewCard
          title="Drifting Categories"
          hint="Trending up month-over-month"
          rows={drifting}
          emptyText="No drifting categories this period."
        />
      </div>

      <div className="flex justify-end">
        <Link
          href={wardPath(ward, "/hotspots")}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Hotspots Explorer <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
