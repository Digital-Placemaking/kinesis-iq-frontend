/**
 * app/admin/emails/send/page.tsx
 * Send mass email page.
 * Allows administrators to compose and send mass emails to all opt-in subscribers.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import AdminLayout from "@/app/admin/components/AdminLayout";
import Card from "@/app/components/ui/Card";
// TODO: Enable when mass email provider is configured
// import SendEmailForm from "./sendEmailForm";

export default async function SendEmailsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("tenant_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!staff || staff.length === 0) {
    redirect("/admin/login?error=no_tenant");
  }

  const tenantId = staff[0].tenant_id;
  const tenantSupabase = await createTenantClient(tenantId);
  const { data: tenant } = await tenantSupabase
    .from("tenants")
    .select("slug, name")
    .eq("id", tenantId)
    .maybeSingle();

  if (!tenant) {
    redirect("/admin/login?error=tenant_not_found");
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Send Mass Email
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Compose an announcement or promotion and send it to all opted-in
            emails for {tenant.name}.
          </p>
        </div>

        <Card className="p-6" variant="elevated">
          <div className="space-y-2">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Mass email is temporarily disabled.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              TODO: Wire up email provider and re-enable this page.
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
