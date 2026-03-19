-- Fix 1: Remove overly permissive INSERT policy on coupon_claims
-- Claims are created via claim_coupon_with_share RPC (SECURITY DEFINER), so direct INSERT is not needed
DROP POLICY IF EXISTS "Anyone can create claims" ON public.coupon_claims;

-- Fix 2: Remove overly broad authenticated user SELECT on user_emails
-- This policy allows any authenticated user to query by email, enabling enumeration
DROP POLICY IF EXISTS "Authenticated users view own email records" ON public.user_emails;