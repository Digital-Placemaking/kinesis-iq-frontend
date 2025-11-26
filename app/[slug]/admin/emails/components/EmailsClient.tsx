/**
 * app/[slug]/admin/emails/components/EmailsClient.tsx
 * Client component for the emails admin page.
 * Handles email list display, search, CSV export, and mass email sending.
 */

"use client";

import { useState, useMemo } from "react";
import { Mail, Send, Download, Search, CheckCircle2 } from "lucide-react";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import SendEmailModal from "./SendEmailModal";

interface EmailData {
  email: string;
  source: "opt_in" | "survey_response";
  created_at: string;
  has_survey_response: boolean;
}

interface EmailsClientProps {
  tenantSlug: string;
  emails: EmailData[];
}

export default function EmailsClient({
  tenantSlug,
  emails,
}: EmailsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

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

  // Filter emails based on search query
  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return emails;
    const query = searchQuery.toLowerCase();
    return emails.filter((email) => email.email.toLowerCase().includes(query));
  }, [emails, searchQuery]);

  // Calculate statistics
  const totalEmails = emails.length;
  const emailsWithSurvey = emails.filter((e) => e.has_survey_response).length;
  const optInOnly = emails.filter(
    (e) => e.source === "opt_in" && !e.has_survey_response
  ).length;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Email", "Source", "Has Survey Response", "Created At"];
    const rows = emails.map((email) => [
      email.email,
      email.source === "opt_in" ? "Opt-In" : "Survey Response",
      email.has_survey_response ? "Yes" : "No",
      formatDate(email.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `emails-${tenantSlug}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Under Construction Notice */}
        <div className="mb-6 sm:mb-8">
          <Card
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
            variant="elevated"
          >
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <span className="text-3xl">🚧</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
                  Under Development
                </h2>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                  The email management feature is currently under development
                  and may have limited functionality.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Emails
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Manage email collection and send mass email campaigns
          </p>
        </div>

        {/* Email Statistics */}
        <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
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
                  With Survey Response
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {emailsWithSurvey}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0 ml-2" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Opt-In Only
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
                  {optInOnly}
                </p>
              </div>
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 shrink-0 ml-2" />
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
              Email addresses from opt-ins and survey responses
            </p>
          </div>

          {/* Search and Actions */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <div className="w-full sm:w-auto">
                <div className="flex flex-col items-end gap-1">
                  <ActionButton
                    icon={Send}
                    className="w-full sm:w-auto"
                    onClick={() => setIsSendModalOpen(true)}
                  >
                    Send Mass Email
                  </ActionButton>
                  {totalEmails > 50 && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Limited to 50 per batch (testing)
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <ActionButton
                  icon={Download}
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleExportCSV}
                >
                  Export CSV
                </ActionButton>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="space-y-3">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email, index) => (
                <div
                  key={`${email.email}-${index}`}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-black dark:text-zinc-50 break-all">
                        {email.email}
                      </span>
                      {email.has_survey_response && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 shrink-0 dark:bg-green-900/20 dark:text-green-400">
                          Survey Completed
                        </span>
                      )}
                      {email.source === "opt_in" &&
                        !email.has_survey_response && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 shrink-0 dark:bg-blue-900/20 dark:text-blue-400">
                            Opt-In
                          </span>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 wrap-break-word">
                      {formatDate(email.created_at)}
                      {email.source === "survey_response" && " • From Survey"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
                {searchQuery
                  ? "No emails match your search."
                  : "No emails collected yet."}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        tenantSlug={tenantSlug}
        recipientCount={totalEmails}
      />
    </>
  );
}
