/**
 * Client wrapper for coupons page
 * Handles modal state for creating coupons
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteConfirmationModal from "@/app/components/ui/DeleteConfirmationModal";
import { deleteCoupon } from "@/app/actions";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import AddCouponModal from "./AddCouponModal";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  title: string;
  description?: string;
  discount?: string | null;
  expires_at?: string | null;
  active?: boolean;
  created_at?: string;
}

interface CouponsClientProps {
  coupons: Coupon[];
  tenantSlug: string;
}

export default function CouponsClient({
  coupons,
  tenantSlug,
}: CouponsClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDisplayCode = (id: string) => {
    // Construct a short, readable code from the UUID
    // Example: take first 4 and last 4 non-hyphen chars
    const compact = id.replace(/-/g, "").toUpperCase();
    const start = compact.slice(0, 4);
    const end = compact.slice(-4);
    return `${start}-${end}`;
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
              Coupon Management
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Create and manage promotional coupons for your customers
            </p>
          </div>
          <div className="shrink-0">
            <ActionButton icon={Plus} onClick={() => setIsAddOpen(true)}>
              Add Coupon
            </ActionButton>
          </div>
        </div>

        <div className="space-y-4">
          {coupons && coupons.length > 0 ? (
            coupons.map((coupon) => {
              const isActive = coupon.active ?? true;
              const discount = coupon.discount || "";

              return (
                <Card key={coupon.id} className="p-6" variant="elevated">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                          {coupon.title}
                        </h3>
                        {isActive && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {coupon.description}
                      </p>
                      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Code:{" "}
                          </span>
                          <span className="font-medium text-black dark:text-zinc-50">
                            {formatDisplayCode(coupon.id)}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Discount:{" "}
                          </span>
                          <span className="font-medium text-black dark:text-zinc-50">
                            {discount}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Expires:{" "}
                          </span>
                          <span className="font-medium text-black dark:text-zinc-50">
                            {formatDate(coupon.expires_at || null)}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Created:{" "}
                          </span>
                          <span className="font-medium text-black dark:text-zinc-50">
                            {formatDate(coupon.created_at || null)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <a
                        href={`/admin/coupons/${coupon.id}/edit`}
                        className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </a>
                      <button
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Delete"
                        onClick={() => {
                          setSelectedId(coupon.id);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center" variant="elevated">
              <p className="text-zinc-600 dark:text-zinc-400">
                No coupons yet. Create your first coupon to get started.
              </p>
            </Card>
          )}
        </div>
      </div>

      <AddCouponModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        tenantSlug={tenantSlug}
        onCreated={() => {
          setIsAddOpen(false);
          router.refresh();
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteOpen(false);
          setSelectedId(null);
        }}
        onConfirm={async () => {
          if (!selectedId) return;
          setIsDeleting(true);
          const result = await deleteCoupon(tenantSlug, selectedId);
          setIsDeleting(false);
          setIsDeleteOpen(false);
          setSelectedId(null);
          if (result.success) {
            router.refresh();
          } else {
            // Optionally surface error via toast or inline message
            console.error("Delete coupon failed:", result.error);
            router.refresh();
          }
        }}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete Coupon"
        isLoading={isDeleting}
      />
    </>
  );
}
