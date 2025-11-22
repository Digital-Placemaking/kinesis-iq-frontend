/**
 * lib/supabase/client.ts
 * Client-side Supabase client creation utility.
 * Provides browser-based Supabase client for client components.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
