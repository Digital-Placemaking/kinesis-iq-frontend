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

interface CouponsListProps {
  coupons: Coupon[];
  tenantSlug: string;
}

/**
 * List of coupons with edit/delete actions
 * Extracted from CouponsClient for use in tabs
 */
export default function CouponsList({ coupons, tenantSlug }: CouponsListProps) {
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
    const compact = id.replace(/-/g, "").toUpperCase();
    const start = compact.slice(0, 4);
    const end = compact.slice(-4);
    return `${start}-${end}`;
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            Active Coupons
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage your promotional coupons
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
              <Card key={coupon.id} className="p-4 sm:p-6" variant="elevated">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-semibold text-black dark:text-zinc-50 break-words">
                        {coupon.title}
                      </h3>
                      {isActive && (
                        <span className="rounded-full bg-green-100 px-2 sm:px-3 py-1 text-xs font-medium text-green-800 shrink-0 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </div>
                    {coupon.description && (
                      <p className="mb-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 break-words">
                        {coupon.description}
                      </p>
                    )}
                    <div className="grid gap-2 text-xs sm:text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Code:{" "}
                        </span>
                        <span className="font-medium text-black dark:text-zinc-50 break-all">
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
                  <div className="flex items-center gap-2 sm:ml-4 sm:shrink-0">
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
