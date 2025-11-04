/**
 * Add coupon modal component
 * Handles creating a new coupon for the tenant
 */
"use client";

import { useState, useTransition } from "react";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { createCoupon } from "@/app/actions";

interface AddCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  onCreated?: () => void;
}

export default function AddCouponModal({
  isOpen,
  onClose,
  tenantSlug,
  onCreated,
}: AddCouponModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed" | "free"
  >("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">(10);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue(10);
    setExpiresAt("");
    setIsActive(true);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
      const result = await createCoupon(tenantSlug, {
        title: title.trim(),
        description: description.trim(),
        discount: discountText,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        active: isActive,
      });

      if (result.success) {
        onCreated?.();
        handleClose();
      } else {
        setError(result.error || "Failed to create coupon");
      }
    });
  };

  const showDiscountValue = discountType !== "free";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Coupon"
      size="lg"
    >
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

        {/* Code is auto-generated if left blank; no field required */}

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
            onClick={handleClose}
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
                Creating...
              </span>
            ) : (
              "Create Coupon"
            )}
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
}
