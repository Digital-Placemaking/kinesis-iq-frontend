import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { getSession } from "@/lib/councillor/api";
import {
  canViewWard,
  lockedWardFor,
  resolveWard,
  type WardParams,
} from "@/lib/councillor/ward-context";
import { loadWardSnapshot } from "@/lib/councillor/ward-snapshot";
import type { CouncillorSession } from "@/lib/councillor/types";
import { RetrySnapshotButton } from "./components/RetrySnapshotButton";
import { wardPath, type Ward } from "@/lib/councillor/wards";
import { logoutAction, retryWardSnapshot } from "../actions";
import { WardNav } from "../components/WardNav";

export default async function WardAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: WardParams;
}) {
  const ward = await resolveWard(params);
  const session = await getSession();
  if (!session) redirect(wardPath(ward, "/login"));

  // Councillors/staff only see their own ward — send them home instead of
  // rendering another ward's chrome over their own data.
  if (!canViewWard(session, ward)) {
    redirect(wardPath(lockedWardFor(session)!));
  }

  return (
    <div className="light-scope flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-kinesisiq-gradient">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white">
              Kinesis<span className="text-amber-400">IQ</span>
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              {ward.label} · {ward.name}
            </span>
          </div>

          <div className="ml-2 hidden md:block">
            <WardNav basePath={ward.basePath} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-slate-300 lg:inline">
              {session.email}
            </span>
            {session.dataset_scope === "sandbox" ? (
              <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Sandbox
              </span>
            ) : null}
            <form action={logoutAction}>
              <input type="hidden" name="ward" value={ward.number} />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto block w-full max-w-7xl px-4 pb-2 md:hidden">
          <WardNav basePath={ward.basePath} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Suspense key={ward.id} fallback={<WardSnapshotLoading />}>
          <WardSnapshotContent ward={ward} session={session}>
            {children}
          </WardSnapshotContent>
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 text-center text-xs text-slate-400">
          Digital Placemaking Inc. · KinesisIQ Platform · {ward.label} Dashboard
        </div>
      </footer>
    </div>
  );
}


function WardSnapshotLoading() {
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-6">
      <Loader2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 animate-spin text-amber-600" />
      <div>
        <p className="font-semibold">Preparing your ward story</p>
        <p className="text-sm text-slate-600">Indicators, signals, and hotspots are loading in the background.</p>
      </div>
    </div>
  );
}

async function WardSnapshotContent({
  ward,
  session,
  children,
}: {
  ward: Ward;
  session: CouncillorSession;
  children: React.ReactNode;
}) {
  const { overview, ts, wv, hs } = await loadWardSnapshot(ward.id);
  const period = overview?.period ?? ts?.period ?? wv?.period ?? hs?.period;

  return (
    <>
      {period && (
        <p className="mb-4 text-sm text-slate-600">
          {period.start} to {period.end}
          {period.snapped && " · Adjusted to available data"}
        </p>
      )}
      {session.dataset_scope === "sandbox" && (
        <p className="mb-4 text-sm text-slate-600">Sandbox story and drill-down figures use a stored demo period.</p>
      )}
      {(!overview || !ts || !wv || !hs) && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p>Some ward data could not be loaded.</p>
          <form action={retryWardSnapshot}>
            <input type="hidden" name="ward" value={ward.number} />
            <RetrySnapshotButton />
          </form>
        </div>
      )}
      {children}
    </>
  );
}
