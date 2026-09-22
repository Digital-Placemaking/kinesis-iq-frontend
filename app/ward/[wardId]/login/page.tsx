import { redirect } from "next/navigation";
import { getSession } from "@/lib/councillor/api";
import {
  canViewWard,
  lockedWardFor,
  resolveWard,
  wardMetadata,
  type WardParams,
} from "@/lib/councillor/ward-context";
import { wardPath } from "@/lib/councillor/wards";
import { LoginForm } from "./LoginForm";

export const generateMetadata = wardMetadata((ward) => `Sign in · KinesisIQ ${ward.label}`);

export default async function WardLoginPage({ params }: { params: WardParams }) {
  const ward = await resolveWard(params);
  const session = await getSession();
  if (session) {
    redirect(wardPath(canViewWard(session, ward) ? ward : lockedWardFor(session)!));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-kinesisiq-gradient px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            KinesisIQ
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {ward.label} Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            {ward.name} · Councillor access
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur">
          <LoginForm ward={ward.number} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Restricted to authorized councillor staff. Sessions are scoped to your
          assigned ward.
        </p>
      </div>
    </main>
  );
}
