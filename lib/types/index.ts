/**
 * lib/types/index.ts
 * Central type definitions export file.
 * Re-exports all type definitions for convenient importing throughout the application.
 * This ensures consistent typing across server actions, components, and utilities.
 */

// Tenant types
export type {
  Tenant,
  TenantTheme,
  TenantDisplay,
  TenantResponse,
} from "./tenant";

// Analytics types
export type {
  EventType,
  AnalyticsEvent,
  AnalyticsEventMetadata,
  TrackEventResponse,
} from "./analytics";

// Survey types (visitor load + submission payloads)
export type {
  QuestionType,
  SurveyQuestion,
  Survey,
  QuestionAnswer,
  SurveySubmission,
  SurveyResponse as SurveyLoadResponse,
  SurveySubmissionResponse,
} from "./survey";

// Survey collector model (surveys + survey_items tables)
export type {
  SurveyKind,
  SurveyStatus,
  Survey as SurveyRecord,
  SurveyItem,
  HydratedSurveyQuestion,
  HydratedSurveyItem,
  CreateSurveyInput,
  UpdateSurveyInput,
  CreateSurveyItemInput,
  UpdateSurveyItemInput,
  SurveysListResponse,
  SurveyWithItemsResponse,
  SurveyMutationResponse,
  SurveyItemMutationResponse,
  SurveyQuestionTotal,
  SurveySummary,
  SurveySummaryResponse,
  SurveyListEntry,
  SurveysAdminListResponse,
} from "./survey-collector";

// Survey response types (survey_responses table rows)
export type { SurveyResponse, SurveyResponseResponse } from "./survey-response";

// Coupon types
export type {
  Coupon,
  CreateCouponInput,
  UpdateCouponInput,
  CouponResponse,
  CouponsResponse,
  CouponMutationResponse,
} from "./coupon";

// Issued coupon types
export type {
  IssuedCoupon,
  IssuedCouponStatus,
  IssueCouponResponse,
  ValidateCouponResponse,
} from "./issued-coupon";

// Question types
export type {
  Question,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionResponse,
  QuestionsResponse,
  QuestionMutationResponse,
  QuestionResult,
  NumericStats,
  BooleanCounts,
  DateCounts,
  TimeCounts,
} from "./question";

// Staff types
export type {
  Staff,
  StaffRole,
  AddStaffInput,
  StaffResponse,
  AddStaffResponse,
} from "./staff";

// Email types
export type {
  EmailOptIn,
  EmailOptInResponse,
  VerifyEmailOptInResponse,
  EmailOptInsResponse,
  MassEmailResponse,
} from "./email";

// Auth types (re-export from lib/auth/server)
export type { BusinessOwner, BusinessOwnerRole } from "@/lib/auth/server";
