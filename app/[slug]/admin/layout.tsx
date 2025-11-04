import { redirect } from "next/navigation";
import { requireBusinessOwnerAccess } from "@/lib/auth/server";
import AdminNav from "./components/AdminNav";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { slug } = await params;

  // Require business owner access for this tenant
  const { user, owner } = await requireBusinessOwnerAccess(
    slug,
    `/admin/login?redirect=/${slug}/admin&error=unauthorized`
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 via-zinc-950 to-black">
      <AdminNav tenantSlug={slug} user={user} owner={owner} />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
