/**
 * lib/types/coupon.ts
 * Coupon type definitions.
 * Defines all TypeScript interfaces and types related to coupons in the system.
 * Coupons are tenant-specific promotional offers that can be issued to visitors.
 */

/**
 * Coupon record from the database
 * Matches the coupons table schema in PostgreSQL
 *
 * @property id - Unique identifier (UUID)
 * @property tenant_id - Foreign key to tenants table (UUID)
 * @property title - Display name/title of the coupon (required)
 * @property description - Optional detailed description of the coupon offer
 * @property discount - Optional discount text (e.g., "20% OFF", "$10 OFF")
 * @property image_url - Optional URL of the coupon image stored in Supabase Storage
 * @property expires_at - Optional expiration date/time (ISO 8601 string)
 * @property active - Whether the coupon is currently active and visible (default: true)
 * @property created_at - Timestamp when the coupon was created (ISO 8601 string)
 */
export interface Coupon {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  discount: string | null;
  image_url: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

/**
 * Input data for creating a new coupon
 * Used when creating coupons via the admin interface
 *
 * @property title - Display name/title of the coupon (required)
 * @property description - Optional detailed description
 * @property discount - Optional discount text
 * @property image_url - Optional URL of the coupon image
 * @property expires_at - Optional expiration date/time (ISO 8601 string)
 * @property active - Whether the coupon should be active (default: true)
 */
export interface CreateCouponInput {
  title: string;
  description?: string | null;
  discount?: string | null;
  image_url?: string | null;
  expires_at?: string | null;
  active?: boolean;
}

/**
 * Input data for updating an existing coupon
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateCouponInput {
  title?: string;
  description?: string | null;
  discount?: string | null;
  image_url?: string | null;
  expires_at?: string | null;
  active?: boolean;
}

/**
 * Response type for coupon fetch operations
 */
export interface CouponResponse {
  coupon: Coupon | null;
  error: string | null;
}

/**
 * Response type for fetching multiple coupons
 */
export interface CouponsResponse {
  coupons: Coupon[] | null;
  error: string | null;
}

/**
 * Response type for coupon create/update operations
 */
export interface CouponMutationResponse {
  success: boolean;
  error: string | null;
  coupon?: Coupon | null;
}
