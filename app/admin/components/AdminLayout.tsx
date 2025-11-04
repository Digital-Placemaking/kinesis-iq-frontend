/**
 * Admin layout wrapper component
 * Provides consistent layout with navigation for all admin pages
 */
import AdminNav from "./AdminNav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <AdminNav />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
