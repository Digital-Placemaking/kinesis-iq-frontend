# Digital Placemaking – Frontend

Multi-tenant web application built with Next.js and Supabase for managing tenant-specific coupons, surveys, and customer engagement.

## Overview

This application enables businesses to create and manage digital coupons, collect customer feedback through surveys, and track visitor engagement. The system supports multiple routing strategies: path-based routes (`yourdomain.com/company1`) and subdomain routes (`company1.yourdomain.com`).

## System Architecture

### Request Flow

When a user visits the application, requests flow through the Next.js middleware layer first. The middleware handles authentication, tenant resolution, and routing logic before requests reach the application routes.

For path-based routing, users access tenant pages directly via `yourdomain.com/{slug}` where the slug matches the tenant identifier. The application uses dynamic route parameters to extract the tenant context.

For subdomain routing, users access tenant pages via `{subdomain}.yourdomain.com`. The middleware extracts the subdomain from the hostname, resolves it to a tenant record via Supabase, and internally rewrites the URL to the path-based format. This allows the application to use a single routing structure while supporting both access methods.

### Authentication and Authorization

Authentication is handled by Supabase Auth, integrated via Next.js middleware and server components. When a user accesses protected routes, the middleware checks for an active session and redirects unauthenticated users to the login page.

The application uses role-based access control with three roles: owner, admin, and staff. Roles are stored in the staff table and associated with users via the user_id foreign key. Server actions and page components use the tenant-scoped Supabase client to enforce role-based permissions.

### Data Isolation with RLS

Row Level Security (RLS) policies in Supabase PostgreSQL enforce tenant data isolation. Each database request includes the tenant context via the `x-tenant-id` HTTP header. The `createTenantClient` function automatically adds this header to all Supabase requests, allowing RLS policies to filter data based on the current tenant context.

RLS policies check the tenant_id column against the current_tenant_id() function, which reads the header value. This ensures that queries only return data belonging to the authenticated user's tenant, preventing cross-tenant data access.

### Rate Limiting

Rate limiting uses Upstash Redis to prevent abuse and manage API usage. The system tracks requests per identifier (email address or IP address) and enforces limits based on configurable thresholds. Rate limit checks occur in server actions before processing requests.

The rate limiting system uses a fixed-window algorithm where each time window has a maximum request count. When a user exceeds the limit, the system returns an error response indicating when they can retry. Redis keys automatically expire when the time window ends, eliminating the need for manual cleanup.

### Server Actions and Data Flow

Server actions handle all data mutations and sensitive operations. They execute on the server and communicate with Supabase using the tenant-scoped client. Server actions implement rate limiting, validation, and error handling before interacting with the database.

The application uses Next.js Server Actions with the `use server` directive, allowing client components to call server-side functions directly without creating API routes. Server actions return structured responses indicating success or failure, along with error messages when appropriate.

### Client-Server Communication

Client components interact with the server through server actions and fetch requests. When a user submits a form or triggers an action, the client component calls the corresponding server action. The server action processes the request, applies rate limiting, validates input, performs database operations, and returns a response.

For read operations, server components fetch data directly from Supabase using the tenant-scoped client. Data is passed to client components as props, enabling a clear separation between server-side data fetching and client-side interactivity.

### Routing and Navigation

The application supports two routing strategies simultaneously. Path-based routing uses dynamic segments in the URL path, while subdomain routing uses the hostname subdomain. The middleware handles the translation between these approaches, ensuring consistent internal routing regardless of access method.

Client-side navigation uses Next.js Link components and router methods. The application includes a utility function that generates correct paths based on the current routing context, ensuring links work correctly whether accessed via path or subdomain.

### Analytics and Tracking

Visitor analytics are tracked through server-side event logging. When users visit tenant pages, the system records page views, survey completions, and coupon issuances. Analytics data is stored in the database and aggregated for display in the admin dashboard.

The analytics system uses server actions to record events, ensuring reliable tracking even with JavaScript disabled. Events include session identifiers to group related activities, enabling funnel analysis and visitor journey tracking.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui components, Lucide React (icons)
- **Database & Auth:** Supabase (PostgreSQL with RLS, Authentication)
- **Rate Limiting:** Upstash Redis
- **Email Service:** Resend
- **APIs:** Google Wallet API (Coupon passes)
- **Utilities:** class-variance-authority, clsx, tailwind-merge

## Environment Setup

### Required Environment Variables

**Supabase Configuration:**

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only, never exposed client-side)

**Upstash Redis Configuration (for rate limiting):**

- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token

To set up Upstash Redis:

1. Create an account at https://upstash.com
2. Create a new Redis database
3. Copy your REST API credentials from the dashboard
4. Add both variables to your `.env.local` file (or Vercel project settings)

**Google Wallet Configuration (optional):**

- `NEXT_GOOGLE_WALLET_ISSUER_ID` - Google Wallet issuer ID
- `NEXT_GOOGLE_WALLET_CLASS_ID` - Google Wallet class ID
- `NEXT_GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `NEXT_GOOGLE_PRIVATE_KEY` - Service account private key

**Resend Configuration (for contact form emails):**

- `RESEND_API_KEY` - Resend API key for sending emails

To set up Resend:

1. Create an account at https://resend.com
2. Generate an API key from the dashboard
3. Verify your sending domain (the from email is set to `noreply@yourdomain.com` in the code)
4. Add `RESEND_API_KEY` to your `.env.local` file (or Vercel project settings)

### Local Development

Create a `.env.local` file in the project root with all required variables. Restart the development server after adding environment variables.

## Multi-Tenant Architecture

### Tenant Context

Each tenant in the system has a unique identifier (UUID) and a slug (human-readable identifier). Tenants can also have a custom subdomain configured, enabling subdomain-based access.

The tenant context is maintained throughout the request lifecycle. Server components and server actions use `createTenantClient(tenantId)` to create Supabase clients that automatically include the tenant context header. This ensures all database queries are scoped to the current tenant.

### RLS Policy Enforcement

Row Level Security policies enforce data isolation at the database level. Every table with tenant-specific data includes a tenant_id column and corresponding RLS policies. Policies check that the current_tenant_id() matches the row's tenant_id, preventing unauthorized data access.

RLS policies also consider user roles. Staff members have limited permissions, while owners and admins have full access to their tenant's data. Policies are defined in SQL and enforced by Supabase PostgreSQL automatically.

### Subdomain Routing

Subdomain routing allows tenants to use custom subdomains for their pages. When a request arrives with a subdomain, the middleware extracts the subdomain value, queries the database to find the matching tenant, and rewrites the URL internally to the path-based format.

This approach maintains a single routing structure while supporting both access methods. Clients use utility functions to generate correct paths based on the current routing context, ensuring navigation works correctly in both scenarios.

## Project Structure

### Core Application Files

- `app/layout.tsx` - Root layout with global metadata and theme configuration
- `app/page.tsx` - Homepage component
- `middleware.ts` - Request middleware for authentication, tenant resolution, and routing

### Tenant-Facing Pages

- `app/[slug]/page.tsx` - Tenant landing page (email collection)
- `app/[slug]/coupons/page.tsx` - Coupons listing page
- `app/[slug]/coupons/[couponId]/survey/page.tsx` - Coupon-specific survey
- `app/[slug]/survey/page.tsx` - Anonymous feedback survey

### Admin Pages

- `app/admin/page.tsx` - Admin dashboard with statistics
- `app/admin/coupons/` - Coupon management (list, create, edit, delete)
- `app/admin/questions/` - Survey question management
- `app/admin/visitors/page.tsx` - Visitor analytics and funnel analysis
- `app/admin/emails/page.tsx` - Email list management
- `app/admin/settings/page.tsx` - Tenant settings and configuration

### Server Actions

- `app/actions/tenant.ts` - Tenant operations (retrieval, settings updates, subdomain resolution)
- `app/actions/coupons.ts` - Coupon CRUD operations
- `app/actions/issued-coupons.ts` - Coupon issuance and validation
- `app/actions/surveys.ts` - Survey fetching and submission
- `app/actions/emails.ts` - Email opt-in management
- `app/actions/questions.ts` - Survey question management
- `app/actions/wallet.ts` - Google Wallet integration
- `app/actions.ts` - Central export point for all server actions

### Utilities and Libraries

- `lib/supabase/server.ts` - Server-side Supabase client factory
- `lib/supabase/tenant-client.ts` - Tenant-scoped Supabase client with RLS headers
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/auth/server.ts` - Authentication utilities and role helpers
- `lib/utils/rate-limit.ts` - Rate limiting with Upstash Redis
- `lib/utils/subdomain.ts` - Subdomain detection and path generation utilities
- `lib/constants/subdomains.ts` - Reserved subdomain list
- `lib/constants/rate-limits.ts` - Rate limit configuration constants

### Shared Components

- `app/components/Footer.tsx` - Global footer with theme toggle
- `app/components/ui/TenantLogo.tsx` - Tenant logo display component
- `app/components/ui/Modal.tsx` - Reusable modal component
- `app/components/ui/Spinner.tsx` - Loading spinner component

## Running Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local` (see Environment Setup above)

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Access the application:
   - Path-based: `http://localhost:3000/{slug}`
   - Subdomain: `http://{subdomain}.localhost:3000`

## Additional Notes

- Social authentication (Apple/Google) is currently disabled with TODO markers until OAuth is fully configured
- Coupon display codes are derived from UUIDs for readability; no separate coupon code column is stored
- Rate limiting fails open if Redis is unavailable, allowing requests but logging warnings
- All server actions include rate limiting to prevent abuse
- The application uses server components by default for optimal performance and SEO
