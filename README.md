# KinesisIQ Frontend

Multi-tenant web application built with Next.js and Supabase for managing tenant-specific coupons, surveys, and customer engagement analytics.

## Overview

KinesisIQ is a Conversational Intelligence and Predictive Insight Platform that transforms real-world interactions into foresight. This application enables businesses (pilots) to create and manage digital coupons, collect customer feedback through surveys, and track visitor engagement with comprehensive analytics. The system supports multiple routing strategies: path-based routes (`yourdomain.com/pilot-slug`) and subdomain routes (`pilot-slug.yourdomain.com`).

## Tech Stack

### Core Framework

- **Next.js 16.0.1** - React framework with App Router for server-side rendering and routing
- **TypeScript 5** - Type-safe JavaScript for better developer experience and code reliability
- **React 19.2.0** - UI library for building interactive user interfaces
- **Node.js** - Runtime environment

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - High-quality React component library built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Icon library for consistent iconography
- **Framer Motion** - Animation library for smooth transitions and interactions
- **Recharts** - Charting library for data visualization

### Backend & Database

- **Supabase** - Backend-as-a-Service platform providing:
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication and user management (Supabase Auth)
  - Real-time subscriptions
  - Storage for file uploads
  - Server-side RPC functions

### Infrastructure & Services

- **Vercel** - Hosting and deployment platform
  - Serverless functions
  - Edge network
  - Automatic deployments
- **Vercel Analytics** - Web analytics and performance monitoring
- **Upstash Redis** - Serverless Redis for:
  - Rate limiting (email submissions, coupon issuance)
  - Survey completion tracking
  - Distributed caching
- **Resend** - Email delivery service for:
  - Mass email campaigns
  - Transactional emails
  - Contact form submissions
- **Google Wallet API** - Integration for digital coupon passes
- **Google OAuth** - Direct OAuth implementation for tenant email collection

### Development Tools

- **ESLint** - Code linting and quality checks
- **class-variance-authority** - For component variant management
- **clsx** - Utility for constructing className strings conditionally
- **tailwind-merge** - Merge Tailwind CSS classes without conflicts
- **jose** - JWT handling for Google Wallet
- **html5-qrcode** - QR code scanning functionality

## System Architecture

### Deployment Infrastructure

The application is deployed on **Vercel** with the following architecture:

- **Edge Network**: Global CDN for static assets
- **Serverless Functions**: Next.js API routes and server actions run as serverless functions
- **Automatic Scaling**: Handles traffic spikes automatically
- **Environment Variables**: Managed through Vercel dashboard
- **Custom Domain**: Supports both path-based and subdomain routing

### Request Flow

When a user visits the application, requests flow through the Next.js middleware layer first. The middleware handles authentication, tenant resolution, and routing logic before requests reach the application routes.

1. **Request arrives** → Middleware intercepts
2. **Subdomain extraction** (if applicable) → Resolved to tenant slug
3. **Tenant resolution** → Database lookup via `resolve_tenant` RPC
4. **Authentication check** → Session validation for protected routes
5. **URL rewriting** → Subdomain routes rewritten to path-based format
6. **Request forwarded** → To appropriate route handler

For path-based routing, users access tenant pages directly via `yourdomain.com/{slug}` where the slug matches the tenant identifier. The application uses dynamic route parameters to extract the tenant context.

For subdomain routing, users access tenant pages via `{subdomain}.yourdomain.com`. The middleware extracts the subdomain from the hostname, resolves it to a tenant record via Supabase, and internally rewrites the URL to the path-based format. This allows the application to use a single routing structure while supporting both access methods.

### Authentication and Authorization

Authentication is handled by **Supabase Auth**, integrated via Next.js middleware and server components. The system supports two authentication flows:

1. **Admin Authentication** (Supabase Auth):

   - Email/password authentication
   - OAuth providers (Google) for admin account creation
   - Password reset via email links
   - Session management via cookies

2. **Tenant Email Collection** (Direct Google OAuth):
   - Direct Google OAuth for collecting visitor emails
   - Does NOT create Supabase Auth users
   - Stores emails in `email_opt_ins` table
   - Allows visitors to skip surveys if email already exists

When a user accesses protected routes, the middleware checks for an active session and redirects unauthenticated users to the login page.

The application uses role-based access control (RBAC) with three roles:

- **Owner** - Full access to all tenant features, can manage staff and settings
- **Admin** - Administrative access, can manage most tenant settings
- **Staff** - Limited access, can only view issued coupons

Roles are stored in the `staff` table and associated with users via the `user_id` foreign key. Server actions and page components use the tenant-scoped Supabase client to enforce role-based permissions.

### Data Isolation with RLS

Row Level Security (RLS) policies in Supabase PostgreSQL enforce tenant data isolation. Each database request includes the tenant context via the `x-tenant-id` HTTP header. The `createTenantClient` function automatically adds this header to all Supabase requests, allowing RLS policies to filter data based on the current tenant context.

RLS policies check the `tenant_id` column against the `current_tenant_id()` function, which reads the header value. This ensures that queries only return data belonging to the authenticated user's tenant, preventing cross-tenant data access.

**Key RLS Features:**

- Automatic tenant isolation for all queries
- Role-based permissions (staff vs owner/admin)
- Server-side enforcement (cannot be bypassed client-side)
- Transparent to application code (handled by Supabase client)

### Analytics Tracking

Visitor analytics are tracked through server-side event logging. The system uses a Supabase admin client (with service role key) to bypass RLS for analytics inserts, ensuring reliable tracking even when users are not authenticated.

**Analytics Event Types:**

- `page_visit` - Visitor lands on tenant page
- `survey_completion` - Visitor completes a survey
- `code_copy` - Visitor copies coupon code
- `coupon_download` - Visitor downloads coupon image
- `wallet_add` - Visitor adds coupon to digital wallet

Events are stored in the `analytics_events` table with session identifiers to group related activities, enabling funnel analysis and visitor journey tracking.

**Vercel Analytics** is also integrated for web performance monitoring and user behavior tracking.

### Rate Limiting

Rate limiting uses **Upstash Redis** to prevent abuse and manage API usage. The system tracks requests per identifier (email address or IP address) and enforces limits based on configurable thresholds. Rate limit checks occur in server actions before processing requests.

The rate limiting system uses a fixed-window algorithm where each time window has a maximum request count. When a user exceeds the limit, the system returns an error response indicating when they can retry. Redis keys automatically expire when the time window ends, eliminating the need for manual cleanup.

**Rate Limit Strategy:**

- Fails open if Redis is unavailable (logs warning, allows request)
- Per-endpoint configuration via constants
- Automatic key expiration
- Clear error messages for rate limit violations
- IP-based rate limiting for coupon issuance (prevents abuse)
- Email-based rate limiting for email submissions

**Rate Limit Types:**

- Email submission: Per email address
- Coupon issuance: Per IP address and coupon ID
- Survey completion: Tracked in Redis (prevents re-submission)

### Survey Completion Tracking

Survey completion is tracked using **Upstash Redis** to prevent users from completing the same survey multiple times. When a user completes a survey, a Redis key is set with a 30-day expiration. Before allowing survey access, the system checks if the key exists.

**Survey Tracking Features:**

- Email-based tracking (if email provided)
- Anonymous tracking (if no email)
- 30-day expiration
- Coupon-specific tracking (for coupon surveys)
- Prevents bypassing by changing email in URL

### Server Actions and Data Flow

Server actions handle all data mutations and sensitive operations. They execute on the server and communicate with Supabase using the tenant-scoped client. Server actions implement rate limiting, validation, and error handling before interacting with the database.

The application uses Next.js Server Actions with the `use server` directive, allowing client components to call server-side functions directly without creating API routes. Server actions return structured responses indicating success or failure, along with error messages when appropriate.

**Server Action Pattern:**

1. Authentication check
2. Tenant resolution
3. Rate limit check
4. Input validation
5. Database operation (with tenant-scoped client)
6. Structured response return

### Client-Server Communication

Client components interact with the server through server actions and fetch requests. When a user submits a form or triggers an action, the client component calls the corresponding server action. The server action processes the request, applies rate limiting, validates input, performs database operations, and returns a response.

For read operations, server components fetch data directly from Supabase using the tenant-scoped client. Data is passed to client components as props, enabling a clear separation between server-side data fetching and client-side interactivity.

### Admin Dashboard Architecture

The admin dashboard is a **single-page application (SPA)** with client-side tab switching. All admin sections are loaded on initial page load, and tab switching happens client-side without page reloads.

**Admin Sections:**

- **Dashboard** - Community Pulse Dashboard with KPIs, sentiment distribution, and engagement funnel
- **Questions** - Survey question management with live preview
- **Coupons** - Coupon management and issued coupons tracking
- **Analytics** - Detailed analytics with charts and metrics
- **Emails** - Email list management and mass email sending
- **Settings** - Tenant settings, logo, subdomain, and customization
- **Customization** - Background image customization (coming soon)

**Admin Navigation:**

- Tenant-specific routes: `/{slug}/admin`
- Client-side tab switching (no page reloads)
- Loading states for each section
- Responsive design with mobile support

## Important Data Types

The application uses comprehensive TypeScript type definitions to ensure type safety across all database operations. All types are defined in `lib/types/` and exported from `lib/types/index.ts`.

### Core Entity Types

#### Tenant Types (`lib/types/tenant.ts`)

- **`Tenant`** - Full tenant record from database (id, slug, subdomain, name, logo_url, website_url, theme, active, background_url, created_at)
- **`TenantTheme`** - Theme configuration (primary, secondary colors)
- **`TenantDisplay`** - Simplified tenant data for frontend display
- **`TenantResponse`** - Response wrapper for tenant operations

#### Coupon Types (`lib/types/coupon.ts`)

- **`Coupon`** - Coupon record (id, tenant_id, title, description, discount, expires_at, active, created_at)
- **`CreateCouponInput`** - Input for creating new coupons
- **`UpdateCouponInput`** - Input for updating existing coupons
- **`CouponResponse`** - Response wrapper for coupon fetch operations
- **`CouponsResponse`** - Response wrapper for multiple coupons
- **`CouponMutationResponse`** - Response wrapper for create/update operations

#### Issued Coupon Types (`lib/types/issued-coupon.ts`)

- **`IssuedCoupon`** - Issued coupon record (id, tenant_id, coupon_id, code, status, max_redemptions, redemptions_count, issued_to, email, expires_at, issued_at, redeemed_at, revoked_at, metadata)
- **`IssuedCouponStatus`** - Enum: "issued" | "redeemed" | "revoked" | "expired"
- **`IssueCouponResponse`** - Response wrapper for coupon issuance
- **`ValidateCouponResponse`** - Response wrapper for coupon validation

#### Survey Types (`lib/types/survey.ts`)

- **`QuestionType`** - Enum of all question types (ranked_choice, sentiment, single_choice, multiple_choice, likert_5, likert_7, nps, rating_5, yes_no, open_text, numeric, slider, date, time)
- **`SurveyQuestion`** - Question record (id, tenant_id, question, type, options, order_index)
- **`Survey`** - Survey structure (tenant_id, coupon_id, title, description, questions)
- **`QuestionAnswer`** - Answer for a single question (question_id, answer_text, answer_number, answer_boolean)
- **`SurveySubmission`** - Complete survey submission (survey_id, coupon_id, email, answers)
- **`SurveyResponse`** - Response wrapper for survey operations
- **`SurveySubmissionResponse`** - Response wrapper for submission operations

#### Question Types (`lib/types/question.ts`)

- **`Question`** - Question record with is_active flag
- **`CreateQuestionInput`** - Input for creating new questions
- **`UpdateQuestionInput`** - Input for updating existing questions
- **`QuestionResult`** - Statistics for question results (totalResponses, choiceCounts, numericStats, booleanCounts, textResponses, dateCounts, timeCounts)
- **`NumericStats`** - Statistics for numeric questions (min, max, mean, median, distribution)
- **`BooleanCounts`** - Counts for yes/no questions (yes, no)
- **`DateCounts`** - Count by date (Record<string, number>)
- **`TimeCounts`** - Count by time (Record<string, number>)

#### Survey Answer Types (`lib/types/survey-answer.ts`)

- **`MultipleChoiceAnswer`** - Array of selected options
- **`SingleChoiceAnswer`** - Single selected option as text
- **`RankedChoiceAnswer`** - Array of options in ranked order
- **`NumericAnswer`** - Numeric value
- **`BooleanAnswer`** - Boolean value
- **`TextAnswer`** - Text response
- **`DateAnswer`** - Date string (ISO 8601)
- **`TimeAnswer`** - Time string (HH:mm)
- **`SurveyAnswer`** - Union type of all answer structures

#### Analytics Types (`lib/types/analytics.ts`)

- **`EventType`** - Enum: "page_visit" | "code_copy" | "coupon_download" | "wallet_add" | "survey_completion"
- **`AnalyticsEvent`** - Event record (id, tenant_id, event_type, session_id, email, metadata, created_at)
- **`AnalyticsEventMetadata`** - Optional metadata (coupon_id, survey_id, issued_coupon_id)
- **`TrackEventResponse`** - Response wrapper for tracking operations

#### Staff Types (`lib/types/staff.ts`)

- **`Staff`** - Staff record (id, tenant_id, user_id, role, email, created_at, updated_at)
- **`StaffRole`** - Enum: "owner" | "admin" | "staff"
- **`AddStaffInput`** - Input for adding staff (email, role)
- **`StaffResponse`** - Response wrapper for staff operations
- **`AddStaffResponse`** - Response wrapper for add staff operations

#### Email Types (`lib/types/email.ts`)

- **`EmailOptIn`** - Email opt-in record (id, tenant_id, email, consent_at)
- **`EmailOptInResponse`** - Response wrapper for opt-in operations
- **`VerifyEmailOptInResponse`** - Response wrapper for verification
- **`EmailOptInsResponse`** - Response wrapper for fetching opt-ins
- **`MassEmailResponse`** - Response wrapper for mass email operations

#### Auth Types (`lib/auth/server.ts`)

- **`BusinessOwner`** - Business owner/staff record (id, tenant_id, user_id, role, email, created_at)
- **`BusinessOwnerRole`** - Enum: "owner" | "admin" | "staff"

### Type Safety Principles

1. **No `any` types** - All database operations use explicit types
2. **Separate type files** - Each domain has its own type definition file
3. **Comprehensive comments** - All types include JSDoc comments explaining their purpose
4. **Response wrappers** - All server actions return typed response objects
5. **Input validation** - Separate input types for create/update operations
6. **Central exports** - All types exported from `lib/types/index.ts` for easy imports

## Environment Setup

### Required Environment Variables

**Supabase Configuration:**

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only, never exposed client-side)
  - Required for analytics tracking and user invitations
  - Must be kept secret and never committed to version control

**Upstash Redis Configuration (for rate limiting and survey tracking):**

- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token

To set up Upstash Redis:

1. Create an account at https://upstash.com
2. Create a new Redis database
3. Copy your REST API credentials from the dashboard
4. Add both variables to your `.env.local` file (or Vercel project settings)

**Google OAuth Configuration (for tenant email collection):**

- `GOOGLE_OAUTH_CLIENT_ID` - Google OAuth client ID from Google Cloud Console
- `GOOGLE_OAUTH_CLIENT_SECRET` - Google OAuth client secret from Google Cloud Console

To set up Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** (or **People API**)
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Configure OAuth consent screen (Application type: Web application)
6. Add **Authorized redirect URIs**:
   - `https://yourdomain.com/auth/oauth-callback`
   - `https://*.yourdomain.com/auth/oauth-callback` (for subdomains)
   - `http://localhost:3000/auth/oauth-callback` (for local development)
7. Copy **Client ID** and **Client Secret** to your `.env.local` file

**Note**: This is separate from Supabase OAuth. This direct OAuth implementation does NOT create Supabase Auth users - it only collects email addresses for the `email_opt_ins` table.

**Google Wallet Configuration (optional):**

- `NEXT_GOOGLE_WALLET_ISSUER_ID` - Google Wallet issuer ID
- `NEXT_GOOGLE_WALLET_CLASS_ID` - Google Wallet class ID
- `NEXT_GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `NEXT_GOOGLE_PRIVATE_KEY` - Service account private key

**Resend Configuration (for contact form and mass emails):**

- `RESEND_API_KEY` - Resend API key for sending emails

To set up Resend:

1. Create an account at https://resend.com
2. Generate an API key from the dashboard
3. Verify your sending domain
4. Add `RESEND_API_KEY` to your `.env.local` file (or Vercel project settings)

**Site Configuration:**

- `NEXT_PUBLIC_SITE_URL` - Public URL of your application (e.g., `https://yourdomain.com`)
  - Used for OAuth redirects and email links

### Supabase Redirect URL Configuration

**Important**: For password reset and account creation links to work, configure Supabase redirect URLs correctly:

**Site URL:**

```
https://www.digitalplacemaking.ca
```

(No trailing slash)

**Redirect URLs:**

```
http://localhost:3000/**
https://www.digitalplacemaking.ca/**
https://digitalplacemaking.ca/**
```

The `/**` wildcard is required to allow redirects to any path (e.g., `/auth/callback`, `/auth/reset-password`).

### Local Development

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd kinesis-iq-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the project root with all required variables (see above).

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Homepage: `http://localhost:3000`
   - Path-based tenant: `http://localhost:3000/{slug}`
   - Subdomain tenant: `http://{subdomain}.localhost:3000` (requires local DNS configuration)

### Production Deployment

The application is designed to be deployed on **Vercel**:

1. **Connect repository to Vercel:**

   - Import your Git repository
   - Vercel will auto-detect Next.js

2. **Configure environment variables:**

   - Add all required environment variables in Vercel project settings
   - Use Vercel's environment variable management

3. **Configure custom domain:**

   - Add your domain in Vercel project settings
   - Configure DNS records as instructed
   - For subdomain support, set up wildcard DNS: `*.yourdomain.com` → Vercel

4. **Deploy:**

   - Automatic deployments on push to main branch
   - Preview deployments for pull requests

5. **Build the application:**

   ```bash
   npm run build
   ```

## Multi-Tenant Architecture

### Tenant Context

Each tenant in the system has a unique identifier (UUID) and a slug (human-readable identifier). Tenants can also have a custom subdomain configured, enabling subdomain-based access.

The tenant context is maintained throughout the request lifecycle. Server components and server actions use `createTenantClient(tenantId)` to create Supabase clients that automatically include the tenant context header. This ensures all database queries are scoped to the current tenant.

### RLS Policy Enforcement

Row Level Security policies enforce data isolation at the database level. Every table with tenant-specific data includes a `tenant_id` column and corresponding RLS policies. Policies check that the `current_tenant_id()` matches the row's `tenant_id`, preventing unauthorized data access.

RLS policies also consider user roles. Staff members have limited permissions, while owners and admins have full access to their tenant's data. Policies are defined in SQL and enforced by Supabase PostgreSQL automatically.

### Subdomain Routing

Subdomain routing allows tenants to use custom subdomains for their pages. When a request arrives with a subdomain, the middleware extracts the subdomain value, queries the database to find the matching tenant, and rewrites the URL internally to the path-based format.

This approach maintains a single routing structure while supporting both access methods. Clients use utility functions to generate correct paths based on the current routing context, ensuring navigation works correctly in both scenarios.

**Subdomain Setup:**

1. Configure wildcard DNS: `*.yourdomain.com` → Your server IP (or Vercel)
2. Add subdomain to tenant record in database
3. Middleware automatically handles routing

## Project Structure

### Core Application Files

- `app/layout.tsx` - Root layout with global metadata, theme configuration, and Vercel Analytics
- `app/page.tsx` - Homepage component with testimonials
- `proxy.ts` - Middleware for request handling, authentication, tenant resolution, and routing
- `next.config.ts` - Next.js configuration

### Tenant-Facing Pages

- `app/[slug]/page.tsx` - Tenant landing page (email collection)
- `app/[slug]/coupons/page.tsx` - Coupons listing page
- `app/[slug]/coupons/[couponId]/survey/page.tsx` - Coupon-specific survey
- `app/[slug]/coupons/[couponId]/completed/page.tsx` - Coupon completion page
- `app/[slug]/survey/page.tsx` - Anonymous feedback survey
- `app/[slug]/survey/completed/page.tsx` - Survey completion page

### Admin Pages (Tenant-Specific)

- `app/[slug]/admin/page.tsx` - Admin dashboard (single-page app with tab switching)
- `app/[slug]/admin/components/` - Admin dashboard components
  - `AdminWrapper.tsx` - Main wrapper with tab state management
  - `AdminNav.tsx` - Navigation with tab switching
  - `AdminContent.tsx` - Content area that renders based on active tab
  - `AdminPageContent.tsx` - Server component that fetches all data
  - `DashboardKPICards.tsx` - KPI cards for dashboard
  - `SentimentDistribution.tsx` - Sentiment distribution chart
  - `EngagementFunnel.tsx` - Engagement funnel visualization
- `app/[slug]/admin/questions/` - Survey question management
- `app/[slug]/admin/coupons/` - Coupon management
- `app/[slug]/admin/analytics/` - Analytics dashboard
- `app/[slug]/admin/emails/` - Email list management and mass email
- `app/[slug]/admin/settings/` - Tenant settings and configuration
- `app/[slug]/admin/login/` - Tenant-specific admin login

### Global Admin Pages

- `app/admin/login/page.tsx` - Global admin login (tenant selection)

### Auth Routes

- `app/auth/callback/route.ts` - Supabase Auth callback (admin authentication)
- `app/auth/oauth-callback/route.ts` - Google OAuth callback (tenant email collection)
- `app/auth/reset-password/page.tsx` - Password reset/create page

### Server Actions

- `app/actions/tenant.ts` - Tenant operations (retrieval, settings updates, subdomain resolution)
- `app/actions/coupons.ts` - Coupon CRUD operations
- `app/actions/issued-coupons.ts` - Coupon issuance and validation
- `app/actions/surveys.ts` - Survey fetching and submission
- `app/actions/emails.ts` - Email opt-in management and mass email sending
- `app/actions/questions.ts` - Survey question management
- `app/actions/wallet.ts` - Google Wallet integration
- `app/actions/staff.ts` - Staff management operations
- `app/actions/analytics.ts` - Analytics data fetching
- `app/actions/dashboard.ts` - Dashboard metrics aggregation
- `app/actions/contact.ts` - Contact form submission
- `app/actions/auth.ts` - Authentication operations
- `app/actions/google/oauth-url.ts` - Google OAuth URL generation
- `app/actions/google/oauth.ts` - Google OAuth email storage
- `app/actions.ts` - Central export point for all server actions

### Type Definitions

- `lib/types/` - All TypeScript type definitions
  - `index.ts` - Central export point
  - `tenant.ts` - Tenant-related types
  - `coupon.ts` - Coupon-related types
  - `issued-coupon.ts` - Issued coupon types
  - `survey.ts` - Survey and question types
  - `survey-answer.ts` - Survey answer structures
  - `question.ts` - Question result types
  - `analytics.ts` - Analytics event types
  - `staff.ts` - Staff and role types
  - `email.ts` - Email opt-in types

### Utilities and Libraries

- `lib/supabase/server.ts` - Server-side Supabase client factory (includes admin client)
- `lib/supabase/tenant-client.ts` - Tenant-scoped Supabase client with RLS headers
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/auth/server.ts` - Authentication utilities and role helpers
- `lib/auth/client.ts` - Client-side authentication utilities
- `lib/utils/rate-limit.ts` - Rate limiting with Upstash Redis
- `lib/utils/subdomain.ts` - Subdomain detection and path generation utilities
- `lib/utils/tenant.ts` - Tenant utility functions
- `lib/constants/subdomains.ts` - Reserved subdomain list
- `lib/constants/rate-limits.ts` - Rate limit configuration constants
- `lib/analytics/track.ts` - Analytics event tracking
- `lib/analytics/events.ts` - Analytics event helpers
- `lib/google/oauth.ts` - Google OAuth URL building utilities
- `lib/google/oauth-direct.ts` - Direct Google OAuth implementation

### Shared Components

- `app/components/Footer.tsx` - Global footer with navigation
- `app/components/AuthCallbackHandler.tsx` - Handles Supabase Auth OAuth callbacks
- `app/components/ui/TenantLogo.tsx` - Tenant logo display component
- `app/components/ui/Modal.tsx` - Reusable modal component
- `app/components/ui/Spinner.tsx` - Loading spinner component
- `app/components/ui/Card.tsx` - Card component
- `app/components/ui/ActionButton.tsx` - Action button component
- `app/components/survey/` - Survey-related components
- `components/ui/` - shadcn/ui components (button, card, dialog, etc.)

## Running Locally

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables in `.env.local`** (see Environment Setup above)

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Homepage: `http://localhost:3000`
   - Path-based tenant: `http://localhost:3000/{slug}`
   - Subdomain tenant: `http://{subdomain}.localhost:3000` (requires local DNS configuration)

## Key Features

### Survey System

- **14 Question Types**: Ranked choice, sentiment, single/multiple choice, Likert scales, NPS, rating, yes/no, open text, numeric, slider, date, time
- **Live Preview**: Real-time preview when creating/editing questions
- **Sentiment Tracking**: Special "Sentiment Question" type for sentiment analysis
- **Survey Completion Tracking**: Redis-based tracking prevents re-submission
- **Email Verification**: Ensures users complete survey before getting coupon

### Coupon Management

- **Digital Coupons**: Create, edit, and manage coupons
- **Google Wallet Integration**: Generate digital wallet passes
- **Coupon Issuance**: Track issued coupons with redemption status
- **IP-Based Rate Limiting**: Prevents abuse of coupon generation
- **QR Code Support**: QR codes for coupon redemption

### Analytics Dashboard

- **Community Pulse Dashboard**: Overview with KPIs
- **Sentiment Distribution**: Visual representation of sentiment data
- **Engagement Funnel**: User journey visualization
- **Detailed Analytics**: Page visits, conversions, engagement metrics
- **Vercel Analytics**: Performance and user behavior tracking

### Email Management

- **Email Collection**: Via form submission or Google OAuth
- **Email List Management**: View and search collected emails
- **Mass Email**: Send emails to all collected addresses via Resend
- **Email Verification**: Prevents unauthorized coupon generation

### Admin Features

- **Single-Page Admin**: Client-side tab switching for fast navigation
- **Tenant Switching**: Switch between multiple tenants (if user has access)
- **Role-Based Access**: Owner, admin, and staff roles
- **Customization**: Logo upload, background customization, subdomain management
- **Real-Time Updates**: No page reloads for tab switching

## Additional Notes

- **Type Safety**: All database operations use explicit TypeScript types. No `any` types are used in production code.
- **Direct OAuth Email Collection**: Google OAuth is implemented for tenant email collection. This does NOT create Supabase Auth users - it only collects email addresses.
- **Coupon Codes**: Display codes are derived from UUIDs for readability; no separate coupon code column is stored.
- **Rate Limiting**: Fails open if Redis is unavailable, allowing requests but logging warnings.
- **Server Components**: The application uses server components by default for optimal performance and SEO.
- **Analytics**: Uses admin client to bypass RLS for reliable tracking of unauthenticated visitors.
- **Dark Mode**: Application is configured for dark mode by default.
- **Mobile Responsive**: All pages are optimized for mobile devices.
- **Security**: RLS policies enforce tenant isolation at the database level. IP-based rate limiting prevents abuse.

## License

Copyright © 2025 KinesisIQ by Digital Placemaking. All rights reserved.
