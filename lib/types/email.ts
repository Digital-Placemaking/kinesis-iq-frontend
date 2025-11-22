/**
 * lib/types/email.ts
 * Email type definitions.
 * Defines all TypeScript interfaces and types related to email opt-ins and email management.
 * Email opt-ins are visitor email addresses collected for marketing purposes.
 */

/**
 * Email opt-in record from the database
 * Matches the email_opt_ins table schema in PostgreSQL
 *
 * @property id - Unique identifier (UUID)
 * @property tenant_id - Foreign key to tenants table (UUID)
 * @property email - Email address of the visitor who opted in
 * @property consent_at - Timestamp when the visitor provided consent (ISO 8601 string)
 */
export interface EmailOptIn {
  id: string;
  tenant_id: string;
  email: string;
  consent_at: string;
}

/**
 * Response type for email opt-in operations
 */
export interface EmailOptInResponse {
  success: boolean;
  error: string | null;
}

/**
 * Response type for verifying email opt-in status
 */
export interface VerifyEmailOptInResponse {
  valid: boolean;
  error: string | null;
}

/**
 * Response type for fetching email opt-ins
 */
export interface EmailOptInsResponse {
  emails: EmailOptIn[] | null;
  error: string | null;
}

/**
 * Response type for mass email operations
 */
export interface MassEmailResponse {
  success: boolean;
  sent: number;
  error: string | null;
}
