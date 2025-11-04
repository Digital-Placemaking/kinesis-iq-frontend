/**
 * Emails admin page
 * Manage email collection and mass email campaigns
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import AdminLayout from "../components/AdminLayout";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import { Mail, Send, Download, Search, Eye } from "lucide-react";

export default async function EmailsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Find user's tenant
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

  // Fetch email opt-ins
  const { data: emails, error } = await tenantSupabase
    .from("email_opt_ins")
    .select("*")
    .order("created_at", { ascending: false });

  const totalEmails = emails?.length || 0;
  const pendingEmails = totalEmails; // TODO: Add email status tracking
  const sentEmails = 0; // TODO: Track sent emails
  const failedEmails = 0; // TODO: Track failed emails

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Emails
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Manage email collection and send mass email campaigns
          </p>
        </div>

        {/* Email Statistics */}
        <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Total Emails
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {totalEmails}
                </p>
              </div>
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 shrink-0 ml-2" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Pending
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {pendingEmails}
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-yellow-500 shrink-0 ml-2" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Sent
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {sentEmails}
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500 shrink-0 ml-2" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Failed
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {failedEmails}
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-red-500 shrink-0 ml-2" />
            </div>
          </Card>
        </div>

        {/* Email Collection */}
        <Card className="p-4 sm:p-6" variant="elevated">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-zinc-50">
              Email Collection
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Collected email addresses from opt-in prompts
            </p>
          </div>

          {/* Search and Actions */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search emails..."
                className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              {/* TODO: Enable mass email when provider is configured */}
              <div className="w-full sm:w-auto">
                <ActionButton icon={Send} className="w-full sm:w-auto" disabled>
                  Send Mass Email (disabled)
                </ActionButton>
              </div>
              <div className="w-full sm:w-auto">
                <ActionButton
                  icon={Download}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Export CSV
                </ActionButton>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="space-y-3">
            {emails && emails.length > 0 ? (
              emails.map((email) => (
                <div
                  key={email.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-black dark:text-zinc-50 break-all">
                        {email.email}
                      </span>
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 shrink-0 dark:bg-yellow-900/20 dark:text-yellow-400">
                        Pending
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 break-words">
                      {formatDate(email.created_at)}
                      {email.id && (
                        <>
                          {" • "}Device: {email.id.slice(0, 8)}...
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 self-start sm:self-auto"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
                No emails collected yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
