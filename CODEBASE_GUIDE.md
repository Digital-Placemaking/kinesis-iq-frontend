# KinesisIQ Frontend - Complete Codebase Guide

## 📚 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Routing Structure](#2-routing-structure)
3. [Tenant/Pilot Resolution](#3-tenantpilot-resolution)
4. [Supabase Integration](#4-supabase-integration)
5. [Folder Structure](#5-folder-structure)
6. [Styling & Theming](#6-styling--theming)
7. [State Management](#7-state-management)
8. [Survey/Onboarding Flow](#8-surveyonboarding-flow)
9. [Where to Make Changes](#9-where-to-make-changes)
10. [File Summary Table](#10-file-summary-table)

---

## 1. Architecture Overview

### What is This App?
**KinesisIQ** is a **multi-tenant** web application that allows businesses (called "tenants" or "pilots") to:
- Collect customer emails
- Create and manage digital coupons
- Run surveys to collect feedback
- Track analytics and engagement

### Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Key Concepts

**Multi-Tenant**: One codebase serves multiple businesses. Each business has:
- A unique `slug` (e.g., "kingswayd")
- Optional `subdomain` (e.g., "kingswayd.digitalplacemaking.ca")
- Their own data (coupons, surveys, emails) isolated by `tenant_id`

**Server Components**: Most pages are Server Components (default in Next.js 13+). They run on the server and can directly access the database.

**Server Actions**: Functions marked with `"use server"` that run on the server. Used for form submissions and data mutations.

**Client Components**: Components marked with `"use client"` that run in the browser. Used for interactivity (forms, buttons, animations).

---

## 2. Routing Structure

### Next.js App Router

The app uses **file-based routing** in the `app/` directory:

```
app/
├── page.tsx                    → Homepage (/)
├── layout.tsx                  → Root layout (wraps all pages)
├── [slug]/                     → Dynamic tenant routes
│   ├── page.tsx               → Tenant landing page (/{slug})
│   ├── coupons/
│   │   ├── page.tsx           → Coupons list (/{slug}/coupons)
│   │   └── [couponId]/
│   │       └── survey/
│   │           └── page.tsx   → Coupon survey (/{slug}/coupons/{id}/survey)
│   ├── survey/
│   │   ├── page.tsx           → Anonymous survey (/{slug}/survey)
│   │   └── completed/
│   │       └── page.tsx       → Survey completion (/{slug}/survey/completed)
│   └── admin/                  → Admin dashboard (/{slug}/admin)
├── admin/
│   └── login/
│       └── page.tsx           → Global admin login (/admin/login)
└── auth/
    ├── callback/               → Supabase Auth callback
    └── oauth-callback/         → Google OAuth callback
```

### Route Types

1. **Static Routes**: `app/page.tsx` → `/`
2. **Dynamic Routes**: `app/[slug]/page.tsx` → `/{slug}` (e.g., `/kingswayd`)
3. **Nested Dynamic**: `app/[slug]/coupons/[couponId]/survey/page.tsx` → `/{slug}/coupons/{id}/survey`

### Middleware (`proxy.ts`)

**Location**: `proxy.ts` (root level)

**What it does**:
- Runs on **every request** before pages load
- Handles **authentication** (checks if user is logged in)
- Resolves **subdomains** to tenant slugs
- Rewrites URLs internally (subdomain → slug-based route)
- Protects admin routes

**Example Flow**:
1. User visits `kingswayd.digitalplacemaking.ca`
2. Middleware extracts subdomain: `kingswayd`
3. Queries database to find tenant with subdomain `kingswayd`
4. Rewrites URL internally to `/kingswayd`
5. Page renders using `app/[slug]/page.tsx`

---

## 3. Tenant/Pilot Resolution

### How Tenants Work

**Tenant = Business/Pilot** (e.g., "Kingsway D", "Perruzza", "City of Toronto")

Each tenant has:
- `id` (UUID) - Internal database ID
- `slug` (string) - URL-friendly identifier (e.g., "kingswayd")
- `subdomain` (optional) - Custom subdomain (e.g., "kingswayd")
- `name` (string) - Display name
- `logo_url` (string) - Logo image URL
- `theme` (object) - Custom colors (primary, secondary)
- `active` (boolean) - Whether tenant is active

### Resolution Flow

**Path-Based Routing** (e.g., `domain.com/kingswayd`):
1. User visits `/{slug}`
2. Server component calls `getTenantBySlug(slug)`
3. Supabase RPC function `resolve_tenant` converts slug → UUID
4. Tenant data is fetched and displayed

**Subdomain Routing** (e.g., `kingswayd.domain.com`):
1. User visits subdomain
2. Middleware (`proxy.ts`) extracts subdomain
3. Calls `getTenantBySubdomain(subdomain)`
4. Supabase RPC function `resolve_tenant_by_subdomain` converts subdomain → UUID
5. URL is rewritten internally to `/{slug}`
6. Page renders normally

### Key Files

- `app/actions/tenant.ts` - Functions to fetch tenant data
- `lib/utils/tenant.ts` - Utility functions for tenant data
- `lib/types/tenant.ts` - TypeScript types for tenants

### City of Toronto / Perruzza

These are just **regular tenants** in the database. There's no special code for them. They're identified by their `slug` (e.g., "toronto", "perruzza") and work exactly like any other tenant.

---

## 4. Supabase Integration

### What is Supabase?

**Supabase** is a Backend-as-a-Service (BaaS) that provides:
- **PostgreSQL Database** - Stores all data
- **Authentication** - User login/signup
- **Row Level Security (RLS)** - Database-level security
- **RPC Functions** - Custom database functions

### Supabase Clients

**Three types of clients**:

1. **Regular Client** (`lib/supabase/client.ts`)
   - Client-side only
   - Uses anonymous key
   - For browser-side operations

2. **Server Client** (`lib/supabase/server.ts`)
   - Server-side only
   - Uses anonymous key
   - For server components

3. **Tenant Client** (`lib/supabase/tenant-client.ts`)
   - Server-side only
   - Adds `x-tenant-id` header to all requests
   - Enables Row Level Security (RLS) to filter data by tenant

4. **Admin Client** (`lib/supabase/server.ts` - `createAdminClient()`)
   - Server-side only
   - Uses service role key (bypasses RLS)
   - For analytics and admin operations

### Authentication

**Two types of auth**:

1. **Admin Auth** (Supabase Auth)
   - For business owners/staff
   - Email/password or OAuth
   - Creates Supabase Auth users
   - Stored in `auth.users` table

2. **Tenant Email Collection** (Direct Google OAuth)
   - For visitors/customers
   - Only collects email addresses
   - Does NOT create Supabase Auth users
   - Stored in `email_opt_ins` table

### RPC Functions

**Custom database functions** called from the frontend:

- `resolve_tenant(slug_input)` - Converts slug → tenant UUID
- `resolve_tenant_by_subdomain(subdomain_input)` - Converts subdomain → tenant UUID

**Usage**:
```typescript
const { data: tenantId } = await supabase.rpc("resolve_tenant", {
  slug_input: "kingswayd"
});
```

### Row Level Security (RLS)

**What it does**: Automatically filters database queries based on tenant context.

**How it works**:
1. Tenant client adds `x-tenant-id` header to requests
2. Database RLS policies check `current_tenant_id()` function
3. Only returns rows where `tenant_id` matches
4. Prevents cross-tenant data access

**Example**: When querying coupons, RLS ensures you only see coupons for your tenant.

---

## 5. Folder Structure

### Root Level

```
kinesis-iq-frontend/
├── app/                    → Next.js pages and routes
├── components/             → Shared UI components (shadcn/ui)
├── lib/                    → Utilities, types, helpers
├── public/                 → Static assets (images, icons)
├── proxy.ts                → Middleware (runs on every request)
├── next.config.ts         → Next.js configuration
├── package.json            → Dependencies
└── tsconfig.json           → TypeScript configuration
```

### `app/` Directory

**Main application code**:

```
app/
├── layout.tsx              → Root layout (fonts, metadata, dark mode)
├── page.tsx                → Homepage (/)
├── globals.css             → Global styles, Tailwind config, CSS variables
├── [slug]/                 → Tenant-specific routes
│   ├── page.tsx            → Tenant landing (email collection)
│   ├── components/         → Tenant-specific components
│   ├── coupons/            → Coupon pages
│   ├── survey/             → Survey pages
│   └── admin/              → Admin dashboard
├── actions/                → Server actions (data mutations)
├── components/             → Shared app components
├── admin/                  → Global admin pages
└── auth/                   → Authentication routes
```

### `lib/` Directory

**Utilities and shared code**:

```
lib/
├── types/                  → TypeScript type definitions
│   ├── tenant.ts
│   ├── survey.ts
│   ├── coupon.ts
│   └── index.ts            → Central export
├── supabase/               → Supabase client factories
│   ├── client.ts           → Client-side client
│   ├── server.ts           → Server-side client
│   └── tenant-client.ts    → Tenant-scoped client
├── auth/                   → Authentication utilities
├── utils/                  → Helper functions
│   ├── tenant.ts
│   ├── subdomain.ts
│   └── rate-limit.ts
├── constants/              → Constants (rate limits, reserved subdomains)
└── analytics/              → Analytics tracking
```

### `components/` Directory

**Shared UI components** (shadcn/ui library):

```
components/
└── ui/                     → Reusable UI components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    └── ...
```

### `app/components/` Directory

**App-specific components**:

```
app/components/
├── Footer.tsx              → Global footer
├── ThemeToggle.tsx         → Dark mode toggle
├── survey/                 → Survey components
│   ├── SurveyContainer.tsx → Main survey wrapper
│   ├── QuestionCard.tsx    → Question display
│   ├── SurveyProgress.tsx  → Progress bar
│   └── questions/          → Question input components
└── ui/                     → App-specific UI components
```

---

## 6. Styling & Theming

### Tailwind CSS 4

**Configuration**: `app/globals.css`

**How it works**:
- Uses CSS variables for colors
- Dark mode via `.dark` class
- Custom theme variables defined in `:root` and `.dark`

### Color System

**CSS Variables** (defined in `globals.css`):

```css
:root {
  --background: oklch(1 0 0);        /* White */
  --foreground: oklch(0.145 0 0);    /* Black */
  --primary: oklch(0.205 0 0);        /* Dark gray */
  --border: oklch(0.922 0 0);        /* Light gray */
  --radius: 0.625rem;                /* 10px border radius */
}

.dark {
  --background: oklch(0.145 0 0);    /* Dark */
  --foreground: oklch(0.985 0 0);    /* Light */
  --primary: oklch(0.922 0 0);       /* Light gray */
}
```

**Usage in components**:
```tsx
<div className="bg-background text-foreground border-border">
  {/* Uses CSS variables */}
</div>
```

### Tenant Themes

**Custom colors per tenant** (stored in database):

- `tenant.theme.primary` - Primary color
- `tenant.theme.secondary` - Secondary color

**Note**: Currently, tenant themes are stored but not fully implemented in the UI. You can add theme support by reading `tenant.theme` and applying it to components.

### Spacing & Layout

**Tailwind spacing scale**:
- `p-4` = 1rem (16px) padding
- `gap-6` = 1.5rem (24px) gap
- `rounded-lg` = 0.5rem (8px) border radius
- `rounded-xl` = 0.75rem (12px) border radius

**Common patterns**:
- `max-w-md` = Max width 28rem (448px)
- `max-w-2xl` = Max width 42rem (672px)
- `mx-auto` = Center horizontally

### Animations

**Framer Motion** (used for page animations):

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

**CSS animations** (defined in `globals.css`):
- `.animate-scroll` - Infinite horizontal scroll

### Dark Mode

**Implementation**:
- Dark mode class added to `<html>` via script in `layout.tsx`
- CSS variables switch automatically when `.dark` class is present
- Theme toggle in `app/components/ThemeToggle.tsx`

---

## 7. State Management

### Server Components (Default)

**Most pages are Server Components**:
- Run on the server
- Can directly access database
- No client-side JavaScript
- Better performance and SEO

**Example**:
```tsx
// app/[slug]/page.tsx
export default async function TenantPage({ params }) {
  const { slug } = await params;
  const { tenant } = await getTenantBySlug(slug); // Server-side fetch
  return <TenantLanding tenant={tenant} />;
}
```

### Client Components

**Marked with `"use client"`**:
- Run in the browser
- Can use React hooks (`useState`, `useEffect`)
- For interactive UI (forms, buttons, animations)

**Example**:
```tsx
"use client";
import { useState } from "react";

export default function TenantLanding({ tenant }) {
  const [email, setEmail] = useState("");
  // ... interactive logic
}
```

### State Patterns

**1. Local State** (useState):
- Form inputs, UI toggles
- Component-specific state

**2. Server Actions** (for mutations):
- Form submissions
- Data updates
- Called from client components

**3. URL State** (searchParams):
- Email passed via query parameter
- Navigation state

**4. No Global State**:
- No Redux, Zustand, or Context API
- State is passed via props or URL

---

## 8. Survey/Onboarding Flow

### Current Flow (Not a Traditional Onboarding)

**The app doesn't have a dedicated onboarding flow**. Instead, it uses a **survey system** that can be configured per tenant.

### User Journey

**1. Landing Page** (`app/[slug]/page.tsx`):
- User visits tenant page
- Sees email collection form
- Can sign in with Google or enter email
- **Component**: `TenantLanding.tsx`

**2. Coupons Page** (`app/[slug]/coupons/page.tsx`):
- After email submission, user sees available coupons
- **Component**: `CouponsList.tsx`

**3. Survey** (`app/[slug]/coupons/[couponId]/survey/page.tsx`):
- When user clicks a coupon, they may see a survey
- Survey questions are configured by tenant admin
- **Component**: `SurveyContainer.tsx`

**4. Completion** (`app/[slug]/coupons/[couponId]/completed/page.tsx`):
- After survey, user sees coupon code
- **Component**: `CouponCompletion.tsx`

### Survey Question Types

**14 question types** supported:

1. **sentiment** - 1-5 rating (for sentiment analysis)
2. **ranked_choice** - Single choice (can be used for ranking)
3. **single_choice** - Radio buttons
4. **multiple_choice** - Checkboxes
5. **open_text** - Text input/textarea
6. **rating_5** - 1-5 star rating
7. **likert_5** - 5-point Likert scale
8. **likert_7** - 7-point Likert scale
9. **nps** - Net Promoter Score (0-10)
10. **yes_no** - Yes/No buttons
11. **numeric** - Number input
12. **slider** - Range slider
13. **date** - Date picker
14. **time** - Time picker

### Survey Components

**Main Components**:
- `SurveyContainer.tsx` - Manages survey state, navigation, submission
- `QuestionCard.tsx` - Renders individual questions
- `SurveyProgress.tsx` - Progress indicator
- `SurveyNavigation.tsx` - Previous/Next buttons

**Question Input Components** (`app/components/survey/questions/`):
- `QuestionInput.tsx` - Text input
- `QuestionRadio.tsx` - Radio buttons (for single_choice, ranked_choice)
- `QuestionCheckbox.tsx` - Checkboxes (for multiple_choice)
- `QuestionRating.tsx` - Star rating (for sentiment, rating_5)
- `QuestionLikert.tsx` - Likert scale
- `QuestionNPS.tsx` - NPS scale
- `QuestionYesNo.tsx` - Yes/No buttons
- `QuestionNumeric.tsx` - Number input
- `QuestionSlider.tsx` - Slider
- `QuestionDate.tsx` - Date picker
- `QuestionTime.tsx` - Time picker

### Emotion/Mood Selection

**Not currently implemented as a dedicated UI**. However:

- **Sentiment questions** (`type: "sentiment"`) can be used for emotion collection
- Currently renders as a 1-5 rating scale (`QuestionRating.tsx`)
- You can redesign this to show emotion icons/buttons instead

### Preference Ranking

**Ranked choice questions** (`type: "ranked_choice"`) exist but:
- Currently renders as **radio buttons** (single selection)
- Not a drag-and-drop ranking UI
- You can redesign this to add drag-and-drop functionality

### Routes & Screens

**Complete flow routes**:

1. `/{slug}` - Landing (email collection)
2. `/{slug}/coupons?email=...` - Coupons list
3. `/{slug}/coupons/{couponId}/survey?email=...` - Coupon survey
4. `/{slug}/coupons/{couponId}/completed?email=...` - Coupon completion
5. `/{slug}/survey` - Anonymous survey
6. `/{slug}/survey/completed` - Survey completion

---

## 9. Where to Make Changes

### ✅ Safe to Modify (UI/UX Changes)

**1. Tenant Landing Page**:
- **File**: `app/[slug]/components/TenantLanding.tsx`
- **What**: Email collection form, social login buttons
- **Safe**: Yes - UI only, no backend logic changes needed

**2. Survey Components**:
- **Files**: `app/components/survey/**/*.tsx`
- **What**: Survey UI, question inputs, navigation
- **Safe**: Yes - Can redesign completely

**3. Question Input Components**:
- **Files**: `app/components/survey/questions/*.tsx`
- **What**: Individual question type inputs
- **Safe**: Yes - Can replace with your designs

**4. Styling**:
- **File**: `app/globals.css`
- **What**: Colors, spacing, animations
- **Safe**: Yes - Update CSS variables and Tailwind classes

**5. UI Components**:
- **Files**: `app/components/ui/*.tsx`, `components/ui/*.tsx`
- **What**: Reusable components (buttons, cards, modals)
- **Safe**: Yes - Can modify or create new ones

### ⚠️ Be Careful (Logic Changes)

**1. Server Actions**:
- **Files**: `app/actions/*.ts`
- **What**: Backend logic, database operations
- **Safe**: Only modify if you understand the data flow

**2. Tenant Resolution**:
- **Files**: `app/actions/tenant.ts`, `proxy.ts`
- **What**: How tenants are identified and loaded
- **Safe**: Don't modify unless fixing bugs

**3. Authentication**:
- **Files**: `app/auth/**/*.tsx`, `lib/auth/**/*.ts`
- **What**: Login, OAuth, session management
- **Safe**: Don't modify unless you understand Supabase Auth

**4. Database Types**:
- **Files**: `lib/types/**/*.ts`
- **What**: TypeScript types matching database schema
- **Safe**: Can add new types, but don't break existing ones

### 🎨 Your Reskin Tasks

**1. Mobile Onboarding UI**:
- **Target**: `app/[slug]/components/TenantLanding.tsx`
- **Action**: Redesign the email collection screen
- **Also modify**: `app/globals.css` for colors/spacing

**2. Emotion Selection UI**:
- **Target**: `app/components/survey/questions/QuestionRating.tsx` (for sentiment questions)
- **Action**: Replace rating buttons with emotion icons/buttons
- **Or create**: New component `QuestionEmotion.tsx` and update `QuestionCard.tsx` to use it

**3. Preference Ranking UI**:
- **Target**: `app/components/survey/questions/QuestionRadio.tsx` (for ranked_choice)
- **Action**: Add drag-and-drop ranking (use `@dnd-kit` like in your redesign)
- **Or create**: New component `QuestionRanking.tsx` with drag-and-drop

**4. Color Themes**:
- **Target**: `app/globals.css` (CSS variables)
- **Action**: Update color values
- **Also**: Apply tenant theme colors from database (if needed)

**5. Spacing & Transitions**:
- **Target**: `app/globals.css`, individual components
- **Action**: Update Tailwind classes, add CSS transitions
- **Files**: All component files using `className` props

### 🔒 Working in Your Branch

**You're on the `Zain` branch** - perfect for making changes!

**Best practices**:
1. ✅ Make all changes in your branch
2. ✅ Test locally with `npm run dev`
3. ✅ Commit frequently with clear messages
4. ❌ Never merge to `main` without review
5. ❌ Never push to `main` directly

---

## 10. File Summary Table

| File | What It Does | Important for Reskin? | Safe to Modify? | Notes |
|------|--------------|---------------------|-----------------|-------|
| **ROOT LEVEL** |
| `proxy.ts` | Middleware - handles auth, subdomain routing | ❌ No | ⚠️ Careful | Core routing logic |
| `next.config.ts` | Next.js configuration | ❌ No | ⚠️ Careful | Build settings |
| `package.json` | Dependencies | ❌ No | ⚠️ Careful | Only add packages if needed |
| **LAYOUT & STYLING** |
| `app/layout.tsx` | Root layout, fonts, metadata | ⚠️ Maybe | ✅ Yes | Can modify metadata, fonts |
| `app/globals.css` | Global styles, CSS variables, Tailwind config | ✅ **YES** | ✅ Yes | **Main styling file** |
| `app/page.tsx` | Homepage | ❌ No | ✅ Yes | Not part of tenant flow |
| **TENANT PAGES** |
| `app/[slug]/page.tsx` | Tenant landing page (server component) | ✅ **YES** | ⚠️ Careful | Fetches tenant data |
| `app/[slug]/components/TenantLanding.tsx` | Tenant landing UI (email form) | ✅ **YES** | ✅ Yes | **Main reskin target** |
| `app/[slug]/coupons/page.tsx` | Coupons list page | ⚠️ Maybe | ⚠️ Careful | Server component |
| `app/[slug]/coupons/components/CouponsList.tsx` | Coupons list UI | ⚠️ Maybe | ✅ Yes | Can reskin coupon cards |
| `app/[slug]/survey/page.tsx` | Survey page | ✅ **YES** | ⚠️ Careful | Server component |
| **SURVEY COMPONENTS** |
| `app/components/survey/SurveyContainer.tsx` | Main survey wrapper | ✅ **YES** | ✅ Yes | Manages survey state |
| `app/components/survey/QuestionCard.tsx` | Question display wrapper | ✅ **YES** | ✅ Yes | Routes to question inputs |
| `app/components/survey/SurveyProgress.tsx` | Progress bar | ⚠️ Maybe | ✅ Yes | Can reskin |
| `app/components/survey/SurveyNavigation.tsx` | Prev/Next buttons | ⚠️ Maybe | ✅ Yes | Can reskin |
| **QUESTION INPUTS** |
| `app/components/survey/questions/QuestionInput.tsx` | Text input | ⚠️ Maybe | ✅ Yes | For open_text questions |
| `app/components/survey/questions/QuestionRating.tsx` | Rating scale (1-5) | ✅ **YES** | ✅ Yes | **Used for sentiment - reskin this!** |
| `app/components/survey/questions/QuestionRadio.tsx` | Radio buttons | ✅ **YES** | ✅ Yes | **Used for ranked_choice - add drag-drop!** |
| `app/components/survey/questions/QuestionCheckbox.tsx` | Checkboxes | ⚠️ Maybe | ✅ Yes | For multiple_choice |
| `app/components/survey/questions/QuestionLikert.tsx` | Likert scale | ❌ No | ✅ Yes | Less common |
| `app/components/survey/questions/QuestionNPS.tsx` | NPS scale | ❌ No | ✅ Yes | Less common |
| `app/components/survey/questions/QuestionYesNo.tsx` | Yes/No buttons | ❌ No | ✅ Yes | Less common |
| `app/components/survey/questions/QuestionNumeric.tsx` | Number input | ❌ No | ✅ Yes | Less common |
| `app/components/survey/questions/QuestionSlider.tsx` | Slider | ❌ No | ✅ Yes | Less common |
| `app/components/survey/questions/QuestionDate.tsx` | Date picker | ❌ No | ✅ Yes | Less common |
| `app/components/survey/questions/QuestionTime.tsx` | Time picker | ❌ No | ✅ Yes | Less common |
| **UI COMPONENTS** |
| `app/components/ui/*.tsx` | App-specific UI components | ⚠️ Maybe | ✅ Yes | Buttons, cards, modals |
| `components/ui/*.tsx` | Shared UI components (shadcn) | ⚠️ Maybe | ✅ Yes | Reusable components |
| `app/components/Footer.tsx` | Global footer | ❌ No | ✅ Yes | Can reskin |
| **SERVER ACTIONS** |
| `app/actions/tenant.ts` | Tenant data fetching | ❌ No | ⚠️ Careful | Backend logic |
| `app/actions/surveys.ts` | Survey operations | ❌ No | ⚠️ Careful | Backend logic |
| `app/actions/coupons.ts` | Coupon operations | ❌ No | ⚠️ Careful | Backend logic |
| **LIBRARY CODE** |
| `lib/types/*.ts` | TypeScript types | ❌ No | ⚠️ Careful | Don't break existing types |
| `lib/supabase/*.ts` | Supabase clients | ❌ No | ❌ No | Core infrastructure |
| `lib/utils/*.ts` | Utility functions | ❌ No | ⚠️ Careful | Helper functions |
| `lib/constants/*.ts` | Constants | ❌ No | ⚠️ Careful | Rate limits, reserved subdomains |

### Key Files for Your Reskin

**Priority 1** (Must modify):
1. `app/globals.css` - Colors, spacing, animations
2. `app/[slug]/components/TenantLanding.tsx` - Landing page UI
3. `app/components/survey/questions/QuestionRating.tsx` - Emotion selection
4. `app/components/survey/questions/QuestionRadio.tsx` - Ranking (add drag-drop)

**Priority 2** (Nice to have):
5. `app/components/survey/SurveyContainer.tsx` - Survey wrapper styling
6. `app/components/survey/QuestionCard.tsx` - Question card styling
7. `app/[slug]/coupons/components/CouponsList.tsx` - Coupon cards

**Priority 3** (Optional):
8. `app/components/ui/*.tsx` - Reusable components
9. `app/components/Footer.tsx` - Footer styling

---

## 🎯 Quick Reference

### Where is...?

- **Email collection form**: `app/[slug]/components/TenantLanding.tsx`
- **Sentiment/emotion selection**: `app/components/survey/questions/QuestionRating.tsx` (when question type is "sentiment")
- **Preference ranking**: `app/components/survey/questions/QuestionRadio.tsx` (when question type is "ranked_choice")
- **Text input**: `app/components/survey/questions/QuestionInput.tsx` (when question type is "open_text")
- **Sign-in screen**: `app/[slug]/components/TenantLanding.tsx` (has Google OAuth button)
- **Colors**: `app/globals.css` (CSS variables)
- **Spacing**: Tailwind classes in components + `app/globals.css`
- **Rounded corners**: Tailwind `rounded-*` classes
- **Transitions**: Framer Motion in components + CSS transitions in `globals.css`
- **Animations**: Framer Motion + CSS keyframes in `globals.css`

### How to...?

- **Add a new question type**: Create component in `app/components/survey/questions/`, add case in `QuestionCard.tsx`
- **Change colors**: Update CSS variables in `app/globals.css`
- **Change spacing**: Update Tailwind classes in components
- **Add drag-and-drop**: Install `@dnd-kit` package, create new component or modify `QuestionRadio.tsx`
- **Apply tenant theme**: Read `tenant.theme` prop and apply to components

---

## 📝 Summary

**This is a multi-tenant survey and coupon platform** built with Next.js and Supabase. The main user flow is:

1. **Landing** → Email collection
2. **Coupons** → Browse available coupons
3. **Survey** → Answer questions (if first-time user)
4. **Completion** → Get coupon code

**For your reskin**, focus on:
- ✅ Tenant landing page UI
- ✅ Survey question inputs (especially sentiment and ranked_choice)
- ✅ Global styling (colors, spacing, animations)

**Work safely** in your `Zain` branch and test everything locally before committing!

---

**Questions?** Refer back to this guide or check the code comments in the files themselves.




