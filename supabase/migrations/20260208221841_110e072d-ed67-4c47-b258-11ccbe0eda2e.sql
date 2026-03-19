-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert user emails" ON public.user_emails;

-- Create a restrictive INSERT policy that only allows service role to insert
CREATE POLICY "Service role can insert emails"
ON public.user_emails
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);
