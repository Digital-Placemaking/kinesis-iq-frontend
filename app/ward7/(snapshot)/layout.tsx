import { redirect } from "next/navigation";
import { getSession } from "@/lib/councillor/api";
import { WARD } from "@/lib/councillor/config";

export default async function Ward7SnapshotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/ward7/login");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {children}
      <footer className="bg-black px-6 py-3">
        <div className="mx-auto flex max-w-[1400px] items-center justify-center gap-3 text-xs text-white/70">
          <img
            src="/dp-logo.png"
            alt="Digital Placemaking"
            className="size-6 object-contain"
          />
          <span>
            Digital Placemaking Inc. · KinesisIQ Platform · Ward {WARD.id}{" "}
            Dashboard
          </span>
        </div>
      </footer>
    </div>
  );
}
