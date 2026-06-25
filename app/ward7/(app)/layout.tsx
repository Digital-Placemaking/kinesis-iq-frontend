import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSession } from "@/lib/councillor/api";
import { WARD } from "@/lib/councillor/config";
import { logoutAction } from "../actions";
import { Ward7Nav } from "../components/Ward7Nav";

export default async function Ward7AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/ward7/login");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-kinesisiq-gradient">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white">
              Kinesis<span className="text-amber-400">IQ</span>
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              Ward {WARD.id} · {WARD.name}
            </span>
          </div>

          <div className="ml-2 hidden md:block">
            <Ward7Nav />
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
          <Ward7Nav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 text-center text-xs text-slate-400">
          Digital Placemaking Inc. · KinesisIQ Platform · Ward {WARD.id} Dashboard
        </div>
      </footer>
    </div>
  );
}
