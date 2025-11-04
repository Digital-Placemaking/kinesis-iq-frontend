"use client";

import { useState } from "react";
import { getCouponsForTenant } from "@/app/actions";

export default function CouponForm() {
  const [tenantSlug, setTenantSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCoupons(null);

    try {
      const result = await getCouponsForTenant(tenantSlug);

      if (result.error) {
        setError(result.error);
      } else {
        setCoupons(result.coupons || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="tenant-slug"
            className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
          >
            Tenant Name (slug)
          </label>
          <input
            id="tenant-slug"
            type="text"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            placeholder="e.g., sneakydees or elcaminobar"
            required
            className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Get Coupons"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {coupons !== null && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            Coupons ({coupons.length})
          </h2>
          {coupons.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              No coupons found for this tenant.
            </p>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <h3 className="font-semibold text-black dark:text-zinc-50">
                    {coupon.title}
                  </h3>
                  {coupon.discount && (
                    <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                      {coupon.discount} off
                    </p>
                  )}
                  {coupon.expires_at && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Expires:{" "}
                      {new Date(coupon.expires_at).toLocaleDateString()}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Status: {coupon.active ? "Active" : "Inactive"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
