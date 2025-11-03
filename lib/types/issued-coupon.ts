/**
 * Issued coupon status enum
 * Matches PostgreSQL enum: issued_coupon_status
 */
export type IssuedCouponStatus = "issued" | "redeemed" | "revoked" | "expired";

/**
 * Issued coupon record
 * Matches the issued_coupons table schema
 */
export interface IssuedCoupon {
  id: string;
  tenant_id: string;
  coupon_id: string;
  code: string;
  status: IssuedCouponStatus;
  max_redemptions: number;
  redemptions_count: number;
  issued_to: string | null;
  email: string | null;
  expires_at: string | null;
  issued_at: string;
  redeemed_at: string | null;
  revoked_at: string | null;
  metadata: Record<string, any>;
}

/**
 * Response for coupon issuance
 */
export interface IssueCouponResponse {
  issuedCoupon: IssuedCoupon | null;
  error: string | null;
}

/**
 * Response for coupon validation
 */
export interface ValidateCouponResponse {
  valid: boolean;
  issuedCoupon: IssuedCoupon | null;
  error: string | null;
  message?: string;
}
