/**
 * Edit coupon modal component
 * Handles editing existing coupons
 */
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image, X } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { updateCoupon, getCouponById, uploadCouponImage } from "@/app/actions";

interface EditCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  couponId: string;
  onUpdated?: () => void;
}

export default function EditCouponModal({
  isOpen,
  onClose,
  tenantSlug,
  couponId,
  onUpdated,
}: EditCouponModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed" | "free"
  >("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">(10);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Load coupon data when modal opens
  useEffect(() => {
    if (isOpen && couponId) {
      setIsLoading(true);
      setError(null);
      getCouponById(tenantSlug, couponId).then((result) => {
        setIsLoading(false);
        if (result.error || !result.coupon) {
          setError(result.error || "Failed to load coupon");
          return;
        }
        const c = result.coupon;
        setCoupon(c);
        setTitle(c.title || "");
        setDescription(c.description || "");
        setIsActive(c.active ?? true);
        setImageUrl(c.image_url || null);
        setPreviewUrl(c.image_url || null);

        // Parse discount text to extract type and value
        const discount = c.discount || "";
        if (discount.includes("%")) {
          setDiscountType("percentage");
          const match = discount.match(/(\d+)%/);
          setDiscountValue(match ? Number(match[1]) : "");
        } else if (discount.includes("$")) {
          setDiscountType("fixed");
          const match = discount.match(/\$(\d+(?:\.\d+)?)/);
          setDiscountValue(match ? Number(match[1]) : "");
        } else if (
          discount.toLowerCase().includes("free") ||
          discount === "100% Off"
        ) {
          setDiscountType("free");
          setDiscountValue("");
        } else {
          setDiscountType("percentage");
          setDiscountValue("");
        }

        // Parse expiration date
        if (c.expires_at) {
          const date = new Date(c.expires_at);
          setExpiresAt(date.toISOString().split("T")[0]);
        } else {
          setExpiresAt("");
        }
      });
    }
  }, [isOpen, couponId, tenantSlug]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadCouponImage(tenantSlug, file);

      if (result.url) {
        setImageUrl(result.url);
      } else {
        setUploadError(result.error || "Failed to upload image");
        setPreviewUrl(imageUrl); // Revert to original image
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setPreviewUrl(imageUrl); // Revert to original image
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const normalizedDiscountValue =
      discountType === "free"
        ? null
        : typeof discountValue === "string"
        ? parseFloat(discountValue)
        : discountValue;

    if (
      discountType !== "free" &&
      (normalizedDiscountValue === null || isNaN(normalizedDiscountValue))
    ) {
      setError("Enter a valid discount value");
      return;
    }

    // Build discount text per schema
    let discountText: string | null = null;
    if (discountType === "free") {
      discountText = "100% Off";
    } else if (discountType === "percentage") {
      discountText = `${normalizedDiscountValue}% Off`;
    } else {
      discountText = `$${normalizedDiscountValue} Off`;
    }

    startTransition(async () => {
      const result = await updateCoupon(tenantSlug, couponId, {
        title: title.trim(),
        description: description.trim(),
        discount: discountText,
        image_url: imageUrl,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        active: isActive,
      });

      if (result.success) {
        onUpdated?.();
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Failed to update coupon");
      }
    });
  };

  const showDiscountValue = discountType !== "free";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Coupon" size="lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error && !coupon ? (
        <div className="py-8 text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
              placeholder="e.g., 20% off your next visit"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
              placeholder="Optional description"
            />
          </div>

          {/* Coupon Image */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Coupon Image <span className="text-zinc-500">(Optional)</span>
            </label>
            <p className="mt-1 mb-2 text-xs text-zinc-500 dark:text-zinc-400">
              Upload an image for the coupon (JPEG, PNG, or WebP, max 5MB)
            </p>
            {previewUrl || imageUrl ? (
              <div className="relative mt-2">
                <img
                  src={previewUrl || imageUrl || ""}
                  alt="Coupon preview"
                  className="h-48 w-full rounded-lg border border-zinc-300 object-cover dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white transition-opacity hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 transition-colors hover:border-blue-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-600 dark:hover:bg-zinc-700">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? (
                  <Spinner size="lg" />
                ) : (
                  <>
                    <Image className="mb-2 h-8 w-8 text-zinc-400" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Click to upload image
                    </span>
                  </>
                )}
              </label>
            )}
            {uploadError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {uploadError}
              </p>
            )}
          </div>

          {/* Discount */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free">Free (100% off)</option>
              </select>
            </div>
            {showDiscountValue && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Discount Value *
                </label>
                <input
                  type="number"
                  min={0}
                  step={discountType === "percentage" ? 1 : 0.01}
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                  placeholder={
                    discountType === "percentage" ? "e.g., 20" : "e.g., 5.00"
                  }
                  required
                />
              </div>
            )}
          </div>

          {/* Expiration & Active */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Expiration Date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700"
                />
                Active
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <ActionButton
              type="submit"
              disabled={isPending}
              className="min-w-[120px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Updating...
                </span>
              ) : (
                "Update Coupon"
              )}
            </ActionButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
