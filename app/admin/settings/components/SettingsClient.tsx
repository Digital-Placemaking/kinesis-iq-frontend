"use client";

import { useState } from "react";
import {
  Building2,
  Image,
  Power,
  Users,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe,
  Upload,
  X,
} from "lucide-react";
import type { Tenant } from "@/lib/types/tenant";
import type { BusinessOwner } from "@/lib/auth/server";
import {
  updateTenantSettings,
  updateTenantWebsiteUrl,
  getStaffForTenant,
  uploadLogoImage,
} from "@/app/actions";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";

interface SettingsClientProps {
  tenant: Tenant;
  staffList: BusinessOwner[];
  userRole: "owner" | "admin" | "staff";
  tenantId: string;
}

export default function SettingsClient({
  tenant,
  staffList: initialStaffList,
  userRole,
  tenantId,
}: SettingsClientProps) {
  // Store original values for comparison
  const originalName = tenant.name || "";
  const originalLogoUrl = tenant.logo_url || "";
  const originalWebsiteUrl = tenant.website_url || "";
  const originalActive = tenant.active ?? true;

  // Initialize all fields with existing tenant values
  const [name, setName] = useState(originalName);
  const [logoUrl, setLogoUrl] = useState(originalLogoUrl);
  const [websiteUrl, setWebsiteUrl] = useState(originalWebsiteUrl);
  const [active, setActive] = useState(originalActive);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState(initialStaffList);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    tenant.logo_url || null
  );

  // Track original values (will be updated after successful saves)
  const [originalValues, setOriginalValues] = useState({
    name: originalName,
    logoUrl: originalLogoUrl,
    websiteUrl: originalWebsiteUrl,
    active: originalActive,
  });

  // Check if any values have changed
  const hasChanges =
    name.trim() !== originalValues.name ||
    logoUrl.trim() !== originalValues.logoUrl ||
    websiteUrl.trim() !== originalValues.websiteUrl ||
    active !== originalValues.active;

  const validateAndUploadFile = async (file: File) => {
    // Validate file type (only JPEG, PNG, WEBP)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError(
        "Invalid file type. Please upload a JPEG, PNG, or WebP image."
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size too large. Maximum size is 5MB.");
      return;
    }

    setUploadError(null);
    setUploading(true);

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Upload the file
      // Pass tenantId to bypass resolve_tenant RPC (which may filter by active=true)
      const result = await uploadLogoImage(tenant.slug, file, tenantId);

      if (result.url) {
        // Update logo URL in state
        setLogoUrl(result.url);
        setPreviewUrl(result.url);

        // Automatically save to database
        const settingsResult = await updateTenantSettings(
          tenant.slug,
          {
            logo_url: result.url,
          },
          tenantId
        );

        if (settingsResult.success) {
          setSuccess("Logo uploaded and saved successfully!");
          // Update original values after successful save
          setOriginalValues((prev) => ({
            ...prev,
            logoUrl: result.url || "",
          }));
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setUploadError(
            settingsResult.error || "Failed to save logo URL to database"
          );
        }
      } else {
        setUploadError(result.error || "Failed to upload logo");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndUploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    validateAndUploadFile(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update tenant settings (name, active)
      // Note: logo_url is updated automatically when uploading, so we only update if it's a URL change
      // Pass tenantId to bypass resolve_tenant RPC (which may filter by active=true)
      console.log("Calling updateTenantSettings with:", {
        slug: tenant.slug,
        tenantId,
        active,
        name: name.trim(),
      });

      const settingsResult = await updateTenantSettings(
        tenant.slug,
        {
          name: name.trim(),
          // Only update logo_url if it's different from what we have (URL input change)
          ...(logoUrl !== tenant.logo_url && {
            logo_url: logoUrl.trim() || null,
          }),
          active,
        },
        tenantId
      );

      // Update website URL separately
      // Pass tenantId to bypass resolve_tenant RPC (which may filter by active=true)
      const websiteResult = await updateTenantWebsiteUrl(
        tenant.slug,
        websiteUrl.trim() || null,
        tenantId
      );

      if (settingsResult.success && websiteResult.success) {
        setSuccess("All settings updated successfully!");
        // Update original values after successful save
        setOriginalValues({
          name: name.trim(),
          logoUrl: logoUrl.trim() || "",
          websiteUrl: websiteUrl.trim() || "",
          active,
        });
        // Refresh staff list in case anything changed
        const { staff: refreshedStaff } = await getStaffForTenant(tenant.slug);
        if (refreshedStaff) {
          setStaffList(refreshedStaff);
        }
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorMessage =
          settingsResult.error ||
          websiteResult.error ||
          "Failed to update settings";
        setError(errorMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    owner:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    staff: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
  };

  const roleLabels: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    staff: "Staff",
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card className="p-6" variant="elevated">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 sm:text-xl">
            General Settings
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
            Update your business information and branding.
          </p>
        </div>

        <div className="space-y-4">
          {/* Business Name */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              <Building2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              Business Name
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter business name"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              <Image className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              Logo
            </label>
            <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">
              Drag and drop an image or click to upload. Supports JPEG, PNG, and
              WebP.
            </p>
            <div className="space-y-3">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  uploading
                    ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                    : "border-zinc-300 bg-zinc-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Uploading logo...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Drag and drop your logo here
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          or click to browse
                        </p>
                      </div>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        JPEG, PNG, or WebP (max 5MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {uploadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {uploadError}
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    OR
                  </span>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Enter Logo URL
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    if (e.target.value) {
                      setPreviewUrl(e.target.value);
                    } else {
                      setPreviewUrl(tenant.logo_url || null);
                    }
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                  disabled={uploading}
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Enter a URL to an existing logo image
                </p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mt-2">
                  <p className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Preview:
                  </p>
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              <Globe className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              Website URL
            </label>
            <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
              URL for the 'Visit Our Website' button on completion pages
            </p>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com or /custom-page"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Enter a full URL (http:// or https://) or a relative path
              (starting with /). Leave empty to use the default tenant landing
              page.
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <Power className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Pilot Status
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {active
                    ? "Your pilot is currently active and visible to users."
                    : "Your pilot is deactivated. Users will see a deactivated message."}
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-zinc-300 transition-colors peer-checked:bg-blue-600 dark:bg-zinc-700 dark:peer-checked:bg-blue-500"></div>
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-4">
            <ActionButton
              icon={loading ? Loader2 : Save}
              onClick={handleSave}
              disabled={loading || !hasChanges || !name.trim()}
              className={`w-full sm:w-auto ${
                !hasChanges ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </ActionButton>

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Staff List */}
      <Card className="p-6" variant="elevated">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 sm:text-xl">
            Team Members
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
            View all staff members and their roles for this tenant.
          </p>
        </div>

        {staffList.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            <Users className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
            <p>No staff members found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {staffList.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                    {member.email?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {member.email || "Unknown"}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Added {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    roleColors[member.role] || roleColors.staff
                  }`}
                >
                  {roleLabels[member.role] || member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
