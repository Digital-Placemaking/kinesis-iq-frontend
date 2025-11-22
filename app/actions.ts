/**
 * Main Actions File
 * Re-exports all server actions organized by functionality
 *
 * This file serves as a central export point for all server actions.
 * Actions are organized into separate files by domain:
 * - tenant.ts: Tenant-related operations
 * - coupons.ts: Coupon CRUD operations
 * - emails.ts: Email opt-in and management
 * - surveys.ts: Survey fetching and submission
 * - questions.ts: Survey question management
 * - issued-coupons.ts: Issued coupon operations
 * - wallet.ts: Google Wallet integration
 * - feedback.ts: Feedback submission
 * - contact.ts: Contact form submissions
 *
 * Note: Each action file has "use server" directive at the top.
 * This file is just a re-export module, so it doesn't need "use server".
 */

// Tenant actions
export {
  getTenantBySlug,
  getTenantBySubdomain,
  updateTenantWebsiteUrl,
  updateTenantSettings,
} from "./actions/tenant";

// Coupon actions
export {
  getCouponById,
  getCouponsForTenant,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "./actions/coupons";

// Email actions
export {
  submitEmail,
  submitEmailOptIn,
  verifyEmailOptIn,
  sendMassEmail,
} from "./actions/emails";

// Survey actions
export {
  getSurveyForTenant,
  getSurveyForCoupon,
  submitSurveyAnswers,
} from "./actions/surveys";

// Question management actions
export {
  reorderQuestion,
  toggleQuestionStatus,
  updateQuestion,
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestionResults,
} from "./actions/questions";
export type { QuestionResult } from "@/lib/types/question";

// Issued coupon actions
export {
  issueCoupon,
  hasCompletedSurveyForTenant,
  checkExistingCoupon,
  isCouponAlreadyRedeemed,
  getCouponStatus,
  validateCouponCode,
  getIssuedCouponsPaginated,
  updateIssuedCoupon,
} from "./actions/issued-coupons";

// Wallet actions
export { generateGoogleWalletPass } from "./actions/wallet";

// Feedback actions
export { submitFeedback } from "./actions/feedback";

// Analytics actions
export {
  getAnalyticsSummary,
  getAnalyticsTimeSeries,
} from "./actions/analytics";

// Auth actions
export { updatePassword } from "./actions/auth";

// Staff actions
export { getStaffForTenant } from "./actions/staff";

// Storage actions
export { uploadLogoImage, uploadCouponImage } from "./actions/storage";

// Contact actions
export { submitContactForm } from "./actions/contact";
