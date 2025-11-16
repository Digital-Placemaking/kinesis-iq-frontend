/**
 * Staff Type Definitions
 *
 * Defines all types related to staff members and user roles in the system.
 * Staff members are users who have access to a tenant's admin dashboard.
 */

/**
 * Staff role enum
 * Matches the PostgreSQL enum: staff_role
 *
 * - owner: Full access, can manage all aspects of the tenant
 * - admin: Administrative access, can manage most tenant settings
 * - staff: Limited access, can only view issued coupons
 */
export type StaffRole = "owner" | "admin" | "staff";

/**
 * Staff record from the database
 * Matches the staff table schema in PostgreSQL
 *
 * @property id - Unique identifier (UUID)
 * @property tenant_id - Foreign key to tenants table (UUID)
 * @property user_id - Foreign key to auth.users table (UUID)
 * @property role - Staff role (owner, admin, or staff)
 * @property email - Staff member's email address (for display purposes)
 * @property created_at - Timestamp when the staff member was added (ISO 8601 string)
 * @property updated_at - Timestamp when the staff record was last updated (ISO 8601 string)
 */
export interface Staff {
  id: string;
  tenant_id: string;
  user_id: string;
  role: StaffRole;
  email: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input data for adding a new staff member
 *
 * @property email - Email address of the staff member to invite
 * @property role - Role to assign (owner or staff, not admin)
 */
export interface AddStaffInput {
  email: string;
  role: "owner" | "staff";
}

/**
 * Response type for staff operations
 */
export interface StaffResponse {
  staff: Staff[] | null;
  error: string | null;
}

/**
 * Response type for adding a staff member
 *
 * @property success - Whether the operation succeeded
 * @property error - Error message if operation failed
 * @property userId - UUID of the user (newly created or existing)
 * @property invited - Whether a new invitation email was sent
 */
export interface AddStaffResponse {
  success: boolean;
  error: string | null;
  userId?: string;
  invited?: boolean;
}
