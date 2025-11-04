# Digital Placemaking – Frontend (Next.js + Supabase)

This repository contains the multi-tenant frontend for Digital Placemaking, built on Next.js (App Router) with Supabase for authentication and data access (RLS-enabled).

## Tech Stack

- Next.js 16 (App Router)
- TypeScript, React 19
- Tailwind CSS
- shadcn/ui components
- Supabase (Postgres + RLS, @supabase/ssr, @supabase/supabase-js)

## Important Paths

- Global layout and metadata

  - `app/layout.tsx` – global metadata, icons, theme pre-hydration script
  - `app/page.tsx` – homepage; sets page-level metadata

- Shared UI

  - `app/components/Footer.tsx` – footer with theme toggle and app logo
  - `app/components/ui/TenantLogo.tsx` – tenant logo (falls back to initial); sizes: `sm|md|lg`
  - `app/components/ui/Modal.tsx` – base modal used across admin
  - `app/components/ui/Spinner.tsx` – reusable loading spinner

- Public assets (icons/manifests)

  - `public/dp-logo.png` – app logo
  - `public/favicon.ico`, `public/favicon.svg`, `public/apple-touch-icon.png`, `public/site.webmanifest`

- Supabase integration

  - `lib/supabase/tenant-client.ts` – server client that sets `x-tenant-id` header for RLS
  - `lib/auth/server.ts` – server auth utilities (`requireAuth`, role helpers)
  - `middleware.ts` – protects `/admin` routes

- Server Actions

  - `app/actions.ts` – all server actions (email opt-in, surveys, coupons, issuance, validation, admin CRUD)

- Admin
  - `app/admin/components/AdminLayout.tsx` – shared admin layout/nav
  - `app/admin/page.tsx` – dashboard (overview)
  - `app/admin/coupons/` – coupons list + add/delete with confirmation modal
  - `app/admin/questions/` – survey questions list (reorder, activate/deactivate, edit/add)
  - `app/admin/visitors/page.tsx` – visitor analytics (counts/funnel)

## Environment

Set the standard Supabase vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only for protected scripts/migrations; not exposed client-side)

## Multi‑Tenant + RLS (Important)

- Tenant context is passed via `x-tenant-id` on every Supabase request using `createTenantClient(tenantId)`.
- RLS policies in the database check `tenant_id = current_tenant_id()` and the signed-in user’s role (e.g., via `staff`).
- Admin pages and actions must always use the tenant-scoped client to avoid cross-tenant access.

## Run Locally

```bash
npm install
npm run dev
```

## Notes

- Social auth buttons on pilot pages are intentionally disabled with a TODO comment until OAuth is wired up.
- Coupon display code is derived from the UUID for readability; no separate coupon code column is stored.

1. Next.js
2. Tailwind
3. shad/cn
4. Supabase
