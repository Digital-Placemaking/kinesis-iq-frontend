import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getHotspots, getTopSignals, getWardView } from "@/lib/councillor/api";
import { WARD } from "@/lib/councillor/config";
import type { QueryBundles } from "@/lib/councillor/queries/types";
import { ApiErrorBanner } from "../../components/StateBanner";
import { QueryBuilder } from "./QueryBuilder";

export const metadata = { title: "Signal Explorer · Ward 7" };

export default async function MakeAQueryPage() {
  const [topSignals, wardView, hotspots] = await Promise.allSettled([
    getTopSignals(),
    getWardView(),
    getHotspots(),
  ]);
  const bundles: QueryBundles = {
    topSignals:
      topSignals.status === "fulfilled" ? topSignals.value : null,
    wardView: wardView.status === "fulfilled" ? wardView.value : null,
    hotspots: hotspots.status === "fulfilled" ? hotspots.value : null,
  };
  const allUnavailable = Object.values(bundles).every(
    (bundle) => bundle === null
  );
  const recentYear =
    bundles.topSignals?.meta.recent_year ??
    bundles.wardView?.meta.recent_year ??
    bundles.hotspots?.recent_year;

  return (
    <div className="space-y-6">
      <Header recentYear={recentYear} />

      {allUnavailable ? (
        <ApiErrorBanner />
      ) : (
        <Suspense fallback={<QueryBuilderFallback />}>
          <QueryBuilder bundles={bundles} />
        </Suspense>
      )}
    </div>
  );
}

function Header({ recentYear }: { recentYear?: number }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Signal Explorer</h1>
      <p className="text-sm text-slate-500">
        Ward {WARD.id} · {WARD.name}
        {recentYear ? ` · ${recentYear}` : ""}
      </p>
    </div>
  );
}

function QueryBuilderFallback() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
      {["query-form", "query-result"].map((key) => (
        <Card key={key} className="animate-pulse bg-slate-50 shadow-none">
          <CardContent className="min-h-52" />
        </Card>
      ))}
    </div>
  );
}
