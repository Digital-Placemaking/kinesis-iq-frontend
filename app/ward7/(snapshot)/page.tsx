import { getHotspots, getTopSignals, getWeeklyOverview } from "@/lib/councillor/api";
import { categoryLabel, formatCount, pctLabel } from "@/lib/councillor/format";
import { WARD } from "@/lib/councillor/config";
import type { PctOrNew } from "@/lib/councillor/types";
import { ApiErrorBanner } from "../components/StateBanner";
import { GetFullStoryCta } from "./components/GetFullStoryCta";
import { SnapshotCard } from "./components/SnapshotCard";

export const metadata = { title: "Ward 7 · Signal Overview" };

function weekOfLabel(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function baselineRange(years: number[] | undefined): string {
  if (!years?.length) return "baseline";
  const min = Math.min(...years);
  const max = Math.max(...years);
  return `${min}–${String(max).slice(-2)}`;
}

function slopeLabel(slope: number): string {
  const abs = Math.abs(slope);
  const digits = abs >= 2 ? 1 : 2;
  const sign = slope > 0 ? "+" : "";
  return `${sign}${slope.toFixed(digits)}/mo`;
}

function signedPct(value: PctOrNew): string {
  return pctLabel(value);
}

export default async function Ward7SnapshotPage() {
  const [tsRes, hsRes, wkRes] = await Promise.allSettled([
    getTopSignals(),
    getHotspots(),
    getWeeklyOverview(),
  ]);

  const ts = tsRes.status === "fulfilled" ? tsRes.value : null;
  const hs = hsRes.status === "fulfilled" ? hsRes.value : null;
  const weekIso =
    wkRes.status === "fulfilled"
      ? [...(wkRes.value.data ?? [])].sort((a, b) => {
          const ta = new Date(a.time_bucket).getTime();
          const tb = new Date(b.time_bucket).getTime();
          return tb - ta;
        })[0]?.time_bucket
      : undefined;

  if (!ts && !hs) {
    return (
      <div className="flex flex-1 flex-col">
        <SnapshotHeader weekLabel={weekOfLabel(weekIso)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-8">
          <ApiErrorBanner />
          <GetFullStoryCta />
        </main>
      </div>
    );
  }

  const rising = ts?.rising_categories ?? [];
  const drifting = ts?.drifting_locations ?? [];
  const hotspots = hs?.hotspots ?? [];
  const repeated = ts?.repeated_complaints ?? [];
  const warnings = ts?.early_warning ?? [];
  const topRepeat = repeated[0];
  const months = hs?.recent_months ?? 6;

  return (
    <div className="flex flex-1 flex-col">
      <SnapshotHeader
        weekLabel={weekOfLabel(weekIso)}
        recentYear={ts?.meta.recent_year ?? hs?.recent_year}
      />

      <main className="mx-auto flex w-full flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="grid w-full max-w-7xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SnapshotCard
            index={0}
            title="Rising Categories"
            accent="green"
            headline={String(rising.length)}
            subtitle={`vs ${baselineRange(ts?.meta.baseline_years)} baseline`}
            highlight={
              rising[0]
                ? `↑ ${categoryLabel(rising[0].category)} ${signedPct(rising[0].pct_change)}`
                : undefined
            }
            rows={rising.slice(0, 4).map((c) => ({
              label: categoryLabel(c.category),
              value: signedPct(c.pct_change),
            }))}
          />
          <SnapshotCard
            index={1}
            title="Drifting Locations"
            accent="gold"
            headline={String(drifting.length)}
            subtitle="steepest slope last 6 months"
            highlight={
              drifting[0]
                ? `${drifting[0].fsa} ${slopeLabel(drifting[0].slope)}`
                : undefined
            }
            rows={drifting.slice(0, 3).map((d) => ({
              label: d.fsa,
              value: slopeLabel(d.slope),
            }))}
          />
          <SnapshotCard
            index={2}
            title="Hotspots"
            accent="red"
            headline={String(hotspots.length)}
            subtitle={`top micro-areas last ${months} months`}
            highlight={
              hotspots[0]
                ? `${hotspots[0].fsa} ${formatCount(hotspots[0].total)}`
                : undefined
            }
            rows={hotspots.slice(0, 3).map((h) => ({
              label: h.fsa,
              value: formatCount(h.total),
            }))}
          />
          <SnapshotCard
            index={3}
            title="Repeated Complaints"
            accent="purple"
            headline={topRepeat ? formatCount(topRepeat.count) : "0"}
            subtitle={
              topRepeat
                ? `top issue: ${topRepeat.fsa} ${topRepeat.type.toLowerCase()}`
                : "top recurring issue"
            }
            highlight={repeated.length ? "3+ occurrences" : undefined}
            rows={repeated.slice(0, 3).map((r) => ({
              label: `${r.fsa} ${r.type}`,
              value: formatCount(r.count),
            }))}
          />
          <SnapshotCard
            index={4}
            title="Early Warning Flags"
            accent="blue"
            headline={String(warnings.length)}
            subtitle="vs same period prior years"
            highlight={
              warnings[0]
                ? `${categoryLabel(warnings[0].category)} ${signedPct(warnings[0].pct_change)}`
                : undefined
            }
            rows={warnings.slice(0, 3).map((e) => ({
              label: categoryLabel(e.category),
              value: signedPct(e.pct_change),
            }))}
            emptyText="No flags this period."
          />
        </div>
        <GetFullStoryCta />
      </main>
    </div>
  );
}

function SnapshotHeader({
  weekLabel,
  recentYear,
}: {
  weekLabel?: string | null;
  recentYear?: number;
}) {
  const sub = [
    WARD.name,
    weekLabel ? `Week of ${weekLabel}` : recentYear ? `Data year ${recentYear}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="bg-black px-6 py-5">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ward {Number(WARD.id)} Snapshot
          </h1>
          <p className="mt-1 text-sm text-white/60">{sub}</p>
        </div>
        <div className="rounded-lg bg-white px-2.5 py-1.5">
          <img
            src="/logo.png"
            alt="KinesisIQ"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </div>
      </div>
    </header>
  );
}
