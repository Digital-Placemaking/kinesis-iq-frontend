# Request for Team - Supabase Credentials & Access

## What I'm Working On

I'm doing a **UI/UX reskin** of the mobile onboarding and survey components for the KinesisIQ frontend. Specifically:

1. **Mobile Onboarding UI** - Redesigning the tenant landing page (email collection screen)
2. **Emotion Selection UI** - Replacing the sentiment question UI with a new emotion selection design
3. **Preference Ranking UI** - Adding drag-and-drop functionality to ranked choice questions
4. **General Styling** - Updating colors, spacing, and animations

## What I Need

To see the **real UI with actual data** (not just mock data), I need:

### 1. Supabase Credentials (Required)

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - The Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - The anonymous/public API key
- `SUPABASE_SERVICE_ROLE_KEY` - The service role key (for analytics)

**Where to get these:**
- Supabase Dashboard → Your Project → Settings → API
- Copy the "Project URL" and "anon public" key
- Copy the "service_role" key (keep this secret!)

### 2. Test Tenant Slug (Optional but Helpful)

A real tenant slug to test with, such as:
- Example: `"kingswayd"`, `"perruzza"`, `"toronto"`, etc.
- This lets me visit `http://localhost:3000/{slug}` and see real data

### 3. Optional (Nice to Have)

- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` - For rate limiting (not critical for UI work)
- `RESEND_API_KEY` - For email features (not critical for UI work)
- `GOOGLE_OAUTH_CLIENT_ID` & `GOOGLE_OAUTH_CLIENT_SECRET` - For OAuth testing (not critical for UI work)

## What I Can Do Now vs. What I Need

### ✅ Can Do Now (Without Credentials)
- View component structure in code
- See basic UI layout with mock data at `/demo`
- Start modifying styling files (`app/globals.css`)
- Understand the codebase structure

### ❌ Need Credentials For
- See **real tenant logos** and branding
- See **real survey questions** with actual text
- See **real question options** for ranked choice
- Test the **full user flow** end-to-end
- See how components look with **real data** (not placeholders)
- Verify my changes work with **production-like data**

## Current Status

- ✅ Repository cloned
- ✅ Dependencies installed
- ✅ Dev server running locally
- ✅ Demo page created (but uses mock data)
- ⏳ Waiting for Supabase credentials to see real UI

## How to Provide Credentials

**Option 1: Secure Message/Email**
- Send the credentials via secure channel (Slack DM, encrypted email, etc.)
- I'll add them to `.env.local` (which is gitignored)

**Option 2: Shared Credentials Document**
- If you have a shared password manager or secure doc
- I can access it there

**Option 3: Development Environment**
- If there's a separate dev/staging Supabase project
- That works too - I just need access to see real tenant data

## What Happens After I Get Credentials

1. I'll update `.env.local` with the real values
2. Restart the dev server
3. Visit `http://localhost:3000/{tenant-slug}` to see real data
4. Start making UI/UX changes based on what I see
5. Test changes with real data to ensure they work properly

## Questions?

If you have questions about:
- What I'm changing (just UI/UX, no backend logic)
- Which files I'll modify (component files, CSS, no server actions)
- How to provide credentials securely
- Whether I need database write access (I don't - read-only is fine for UI work)

Feel free to ask!

---

**Note**: I'm working in a separate git branch (`Zain`) so I won't affect the main codebase. All changes are isolated until ready for review.

