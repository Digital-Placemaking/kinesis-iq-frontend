"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getIssuedCouponsPaginated, updateIssuedCoupon } from "@/app/actions";
import Pagination, { PAGINATION } from "@/app/components/ui/Pagination";
import Card from "@/app/components/ui/Card";
import Spinner from "@/app/components/ui/Spinner";
import { Edit, CheckCircle, XCircle, Clock, ChevronDown } from "lucide-react";

interface IssuedCoupon {
  id: string;
  coupon_id: string;
  code: string;
  email: string | null;
  status: "issued" | "redeemed" | "expired" | "cancelled";
  redemptions_count: number;
  max_redemptions: number;
  issued_at: string;
  expires_at: string | null;
  metadata: Record<string, any> | null;
}

interface IssuedCouponsListProps {
  tenantSlug: string;
  canEditCoupons?: boolean; // Not used here, but passed for consistency. Staff CAN edit issued coupons.
}

/**
 * List of issued coupons with pagination
 * Allows editing coupon status and tracking
 * Staff can validate/invalidate issued coupons (but not edit main coupons)
 */
export default function IssuedCouponsList({
  tenantSlug,
  canEditCoupons = true,
}: IssuedCouponsListProps) {
  const [issuedCoupons, setIssuedCoupons] = useState<IssuedCoupon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchIssuedCoupons = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getIssuedCouponsPaginated(
        tenantSlug,
        page,
        PAGINATION.ITEMS_PER_PAGE
      );

      if (result.error) {
        setError(result.error);
        setIssuedCoupons([]);
        setTotalPages(0);
        setTotalItems(0);
      } else {
        setIssuedCoupons(result.issuedCoupons || []);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIssuedCoupons([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuedCoupons(currentPage);
  }, [currentPage, tenantSlug]);

  const handleStatusChange = async (
    issuedCouponId: string,
    newStatus: "issued" | "redeemed" | "expired" | "cancelled"
  ) => {
    setUpdatingId(issuedCouponId);
    try {
      const result = await updateIssuedCoupon(tenantSlug, issuedCouponId, {
        status: newStatus,
      });

      if (result.success) {
        // Refresh the list
        await fetchIssuedCoupons(currentPage);
      } else {
        console.error("Failed to update issued coupon:", result.error);
        setError(result.error || "Failed to update coupon status");
      }
    } catch (err) {
      console.error("Error updating issued coupon:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "redeemed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "expired":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "redeemed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "expired":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
          Issued Coupons
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Track and manage all issued coupon codes
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <Card className="mb-4 p-4" variant="elevated">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        <>
          {issuedCoupons.length > 0 ? (
            <>
              <div className="space-y-4 mb-6">
                {issuedCoupons.map((issuedCoupon) => (
                  <Card
                    key={issuedCoupon.id}
                    className="p-4 sm:p-6"
                    variant="elevated"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="font-mono text-base sm:text-lg font-semibold text-black dark:text-zinc-50 break-all">
                            {issuedCoupon.code}
                          </span>
                          <span
                            className={`flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-xs font-medium shrink-0 ${getStatusColor(
                              issuedCoupon.status
                            )}`}
                          >
                            {getStatusIcon(issuedCoupon.status)}
                            {issuedCoupon.status.charAt(0).toUpperCase() +
                              issuedCoupon.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid gap-2 text-xs sm:text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              Email:{" "}
                            </span>
                            <span className="font-medium text-black dark:text-zinc-50 break-words">
                              {issuedCoupon.email || "Anonymous"}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              Redemptions:{" "}
                            </span>
                            <span className="font-medium text-black dark:text-zinc-50">
                              {issuedCoupon.redemptions_count} /{" "}
                              {issuedCoupon.max_redemptions}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              Issued:{" "}
                            </span>
                            <span className="font-medium text-black dark:text-zinc-50">
                              {formatDate(issuedCoupon.issued_at)}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              Expires:{" "}
                            </span>
                            <span className="font-medium text-black dark:text-zinc-50">
                              {formatDate(issuedCoupon.expires_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4 sm:shrink-0">
                        <div className="relative flex-1 sm:flex-initial">
                          <select
                            value={issuedCoupon.status}
                            onChange={(e) =>
                              handleStatusChange(
                                issuedCoupon.id,
                                e.target.value as any
                              )
                            }
                            disabled={updatingId === issuedCoupon.id}
                            className="w-full sm:w-auto appearance-none rounded-lg border border-zinc-300 bg-white px-3 pr-10 py-2 text-sm text-black transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                          >
                            <option value="issued">Issued</option>
                            <option value="redeemed">Redeemed</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        {updatingId === issuedCoupon.id && (
                          <Spinner size="sm" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={PAGINATION.ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <Card className="p-8 text-center" variant="elevated">
              <p className="text-zinc-600 dark:text-zinc-400">
                No issued coupons yet.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
