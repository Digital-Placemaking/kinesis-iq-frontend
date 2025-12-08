# Frontend Setup Guide

## 📋 What You Need to Install

### 1. **Node.js** (Required)
- **Version**: Node.js 18.x or higher (recommended: 20.x LTS)
- **How to install**: 
  - Download from [nodejs.org](https://nodejs.org/)
  - Or use a version manager like `nvm` (Node Version Manager)
- **Why**: This project uses Next.js which runs on Node.js

### 2. **npm** (Comes with Node.js)
- Automatically installed with Node.js
- Used to install project dependencies

### 3. **Git** (Already installed)
- You already have this since you cloned the repo ✅

---

## 🔍 Backend Dependency Check

**Good news!** This frontend does **NOT require a separate backend server** to run locally.

### How it works:
- **Supabase** acts as your backend (database + authentication)
- All data operations go directly to Supabase from the frontend
- No need to run a separate Express/FastAPI/etc. server

### What you DO need:
- A **Supabase project** with the database schema set up
- The database must have all the required tables and Row Level Security (RLS) policies
- If you don't have access to the Supabase project, you'll need to:
  - Get the Supabase credentials from your team, OR
  - Set up a new Supabase project and run migrations (if available)

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the `kinesis-iq-frontend` folder with the template below.

**Important**: `.env.local` is already in `.gitignore`, so your secrets won't be committed to git.

---

## 🚀 Installation Steps

### Step 1: Navigate to the frontend folder
```bash
cd kinesis-iq-frontend
```

### Step 2: Install dependencies
```bash
npm install
```

This will:
- Download all packages listed in `package.json`
- Create a `node_modules` folder
- Take 1-3 minutes depending on your internet speed

### Step 3: Create `.env.local` file
Copy the template from the section below and fill in your values.

### Step 4: Start the development server
```bash
npm run dev
```

### Step 5: Open your browser
- Go to: `http://localhost:3000`
- You should see the homepage!

---

## ⚠️ What Will Break Without Proper Setup

### 🔴 **Critical (App won't work at all):**
1. **Supabase credentials** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **What breaks**: Can't load any data, can't authenticate users
   - **Error**: "Supabase URL not found" or database connection errors
   - **Solution**: Get these from your Supabase project dashboard

### 🟡 **Important (Features will fail):**
2. **Supabase Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`)
   - **What breaks**: Analytics tracking won't work, some admin features may fail
   - **Error**: Silent failures in analytics, some server actions may error
   - **Solution**: Get from Supabase dashboard (Settings → API → Service Role Key)

3. **Redis credentials** (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
   - **What breaks**: Rate limiting won't work, survey completion tracking disabled
   - **Error**: Rate limits won't be enforced (fails open - allows all requests)
   - **Solution**: Create a free Upstash Redis database at [upstash.com](https://upstash.com)

4. **Resend API Key** (`RESEND_API_KEY`)
   - **What breaks**: Contact form won't send emails, mass email feature won't work
   - **Error**: "Email service is not configured" messages
   - **Solution**: Create account at [resend.com](https://resend.com) and get API key

### 🟢 **Optional (Can use placeholder values):**
5. **Google OAuth** (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`)
   - **What breaks**: "Sign in with Google" button won't work for email collection
   - **Error**: OAuth flow will fail
   - **Solution**: Set up Google OAuth in Google Cloud Console (see README.md for details)

6. **Google Wallet** (All `NEXT_GOOGLE_WALLET_*` variables)
   - **What breaks**: Can't add coupons to Google Wallet
   - **Error**: Wallet feature will be disabled
   - **Solution**: Only needed if you want Google Wallet integration

7. **Site URL** (`NEXT_PUBLIC_SITE_URL`)
   - **What breaks**: OAuth redirects may not work correctly
   - **Error**: Redirects to wrong URLs
   - **Solution**: Set to `http://localhost:3000` for local development

---

## 🧪 Testing Without Full Setup

You can start the app with **minimal configuration** to see the UI:

### Minimum `.env.local` for testing:
```env
# Required - Get from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site URL for local dev
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional - Use placeholder values
UPSTASH_REDIS_REST_URL=https://placeholder.upstash.io
UPSTASH_REDIS_REST_TOKEN=placeholder-token
RESEND_API_KEY=re_placeholder_key
GOOGLE_OAUTH_CLIENT_ID=placeholder-client-id
GOOGLE_OAUTH_CLIENT_SECRET=placeholder-secret
```

**Note**: With placeholder values, some features will show errors, but you can still:
- View the UI
- Navigate pages
- See the structure
- Test styling changes

---

## 📝 Quick Command Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (test build)
npm run build

# Start production server (after build)
npm start

# Run linter
npm run lint
```

---

## 🆘 Troubleshooting

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### "Port 3000 already in use"
- Kill the process using port 3000, or
- Run `npm run dev -- -p 3001` to use a different port

### "Environment variable not found"
- Make sure `.env.local` is in the `kinesis-iq-frontend` folder (not root)
- Restart the dev server after adding env variables
- Check for typos in variable names

### Supabase connection errors
- Verify your Supabase URL and keys are correct
- Check if your Supabase project is active
- Make sure the database has the required tables

---

## 📚 Next Steps

1. **Get Supabase credentials** from your team lead or project manager
2. **Set up optional services** (Redis, Resend) if you need those features
3. **Read the main README.md** for detailed architecture information
4. **Explore the codebase** - start with `app/page.tsx` for the homepage

---

## 💡 Tips for Beginners

- **`.env.local`** is your secret config file - never commit it to git
- **`npm install`** only needs to run once (unless dependencies change)
- **`npm run dev`** starts a hot-reload server - changes appear instantly
- **Supabase** is like Firebase - it's a backend-as-a-service (no server needed)
- **Server Actions** (files with `"use server"`) run on the server, not in the browser

