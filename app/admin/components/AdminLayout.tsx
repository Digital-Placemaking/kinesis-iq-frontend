// AdminLayout
// Layout wrapper component that provides consistent navigation and layout structure for all admin pages.
// Used in: All admin pages (app/admin/page.tsx, app/admin/coupons/page.tsx, etc.)

import AdminNav from "./AdminNav";
import Footer from "@/app/components/Footer";

interface AdminLayoutProps {
  children: React.ReactNode;
  userRole?: "owner" | "admin" | "staff" | null;
}

export default function AdminLayout({ children, userRole }: AdminLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <AdminNav userRole={userRole} />
      <main className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col">
          <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
