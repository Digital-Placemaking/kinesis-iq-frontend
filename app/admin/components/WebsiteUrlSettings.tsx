"use client";

import { useState } from "react";
import { Globe, Save } from "lucide-react";
import { updateTenantWebsiteUrl } from "@/app/actions";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import FormField from "./FormField";

interface WebsiteUrlSettingsProps {
  tenantSlug: string;
  currentUrl: string | null;
}

/**
 * Component for managing the tenant's website URL
 * Used in the admin dashboard to set where the "Visit Our Website" button links to
 */
export default function WebsiteUrlSettings({
  tenantSlug,
  currentUrl,
}: WebsiteUrlSettingsProps) {
  const [websiteUrl, setWebsiteUrl] = useState(currentUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateTenantWebsiteUrl(
        tenantSlug,
        websiteUrl.trim() || null
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.error("Failed to update website URL:", result.error);
        setError(result.error || "Failed to update website URL");
      }
    } catch (err) {
      console.error("Error updating website URL:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Website URL Settings
        </h2>
      </div>

      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Set the URL for the "Visit Our Website" button shown on completion
        pages. Leave empty to use the default tenant landing page.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Website URL"
          type="url"
          placeholder="https://example.com or /custom-page"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={loading}
          icon={Globe}
          helpText="Enter a full URL (http:// or https://) or a relative path (starting with /)"
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
            Website URL updated successfully!
          </div>
        )}

        <ActionButton
          icon={Save}
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Saving...
            </span>
          ) : (
            "Save Website URL"
          )}
        </ActionButton>
      </form>
    </div>
  );
}
