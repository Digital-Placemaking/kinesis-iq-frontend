-- Complete Database Migration Script
-- This script recreates all tables, functions, triggers, RLS policies, and storage buckets

-- =====================================================
-- 1. CREATE ENUM TYPES
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE (user_id, role)
);

-- Locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  client_name TEXT,
  parent_location_id UUID REFERENCES public.locations(id),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- WiFi locations table
CREATE TABLE public.wifi_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount TEXT NOT NULL,
  code TEXT,
  partner_id UUID REFERENCES public.locations(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  share_enabled BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Coupon claims table
CREATE TABLE public.coupon_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  device_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  redemption_code TEXT NOT NULL UNIQUE,
  share_token TEXT UNIQUE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_by UUID REFERENCES auth.users(id),
  referred_by UUID REFERENCES public.coupon_claims(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (id)
);

-- Survey questions table
CREATE TABLE public.survey_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'sentiment',
  options JSONB DEFAULT '[]'::jsonb,
  "order" INTEGER NOT NULL DEFAULT 1,
  partner_id UUID REFERENCES public.locations(id),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Survey responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.survey_questions(id),
  answer TEXT,
  comment TEXT,
  session_id TEXT,
  location_id TEXT,
  partner_id UUID REFERENCES public.locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Engagement events table
CREATE TABLE public.engagement_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  coupon_id UUID REFERENCES public.coupons(id),
  partner_id UUID REFERENCES public.locations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- User emails table
CREATE TABLE public.user_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  email_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  retries INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Partner staff table
CREATE TABLE public.partner_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  partner_id UUID REFERENCES public.locations(id),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- API keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  location_id UUID REFERENCES public.locations(id),
  active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Location traffic table
CREATE TABLE public.location_traffic (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id),
  device_count INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Analytics summary table
CREATE TABLE public.analytics_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.locations(id),
  date DATE NOT NULL,
  hour INTEGER,
  total_visits INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  survey_responses INTEGER DEFAULT 0,
  positive_sentiment INTEGER DEFAULT 0,
  neutral_sentiment INTEGER DEFAULT 0,
  negative_sentiment INTEGER DEFAULT 0,
  coupon_claims INTEGER DEFAULT 0,
  coupon_redemptions INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0.00,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- User wallets table
CREATE TABLE public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT NOT NULL,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  passkit_coupon_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  pass_url TEXT NOT NULL,
  passkit_status TEXT DEFAULT 'issued',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Coupons public view
CREATE OR REPLACE VIEW public.coupons_public AS
SELECT 
  id,
  title,
  description,
  discount,
  code,
  partner_id,
  expires_at,
  created_at
FROM public.coupons
WHERE active = true;

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wifi_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_traffic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE SECURITY DEFINER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =====================================================
-- 5. CREATE DATABASE FUNCTIONS
-- =====================================================

-- Handle new user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Handle updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Get location analytics function
CREATE OR REPLACE FUNCTION public.get_location_analytics(location_slug TEXT)
RETURNS TABLE(
  total_responses BIGINT,
  positive_sentiment BIGINT,
  neutral_sentiment BIGINT,
  negative_sentiment BIGINT,
  total_visits BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT sr.id) as total_responses,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.answer = 'happy') as positive_sentiment,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.answer = 'neutral') as neutral_sentiment,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.answer = 'concerned') as negative_sentiment,
    COUNT(DISTINCT ee.session_id) as total_visits
  FROM public.locations l
  LEFT JOIN public.survey_responses sr ON sr.partner_id = l.id
  LEFT JOIN public.engagement_events ee ON ee.event_data->>'partner_slug' = l.slug
  WHERE l.slug = location_slug
  GROUP BY l.id;
END;
$$;

-- Redeem coupon QR function
CREATE OR REPLACE FUNCTION public.redeem_coupon_qr(p_redemption_code TEXT, p_staff_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_claim record;
  v_staff_partner_id UUID;
BEGIN
  -- Verify staff member
  SELECT partner_id INTO v_staff_partner_id
  FROM public.partner_staff
  WHERE user_id = p_staff_user_id AND active = true;
  
  IF v_staff_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized staff member');
  END IF;
  
  -- Find and validate claim
  SELECT cc.*, c.partner_id
  INTO v_claim
  FROM public.coupon_claims cc
  JOIN public.coupons c ON cc.coupon_id = c.id
  WHERE cc.redemption_code = p_redemption_code;
  
  IF v_claim IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid redemption code');
  END IF;
  
  IF v_claim.redeemed THEN
    RETURN jsonb_build_object('success', false, 'message', 'Coupon already redeemed');
  END IF;
  
  IF v_claim.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Coupon expired');
  END IF;
  
  IF v_claim.partner_id IS NOT NULL AND v_claim.partner_id != v_staff_partner_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Coupon not valid at this location');
  END IF;
  
  -- Mark as redeemed
  UPDATE public.coupon_claims
  SET 
    redeemed = true,
    redeemed_at = now(),
    redeemed_by = p_staff_user_id
  WHERE id = v_claim.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Coupon redeemed successfully',
    'claim', jsonb_build_object(
      'user_email', v_claim.user_email,
      'user_name', v_claim.user_name,
      'claimed_at', v_claim.claimed_at
    )
  );
END;
$$;

-- Claim coupon with share function
CREATE OR REPLACE FUNCTION public.claim_coupon_with_share(
  p_coupon_id UUID,
  p_device_id TEXT,
  p_user_email TEXT DEFAULT NULL,
  p_user_name TEXT DEFAULT NULL,
  p_referred_by_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_claim_id UUID;
  v_redemption_code TEXT;
  v_share_token TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_referred_by_id UUID;
  v_coupon record;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons WHERE id = p_coupon_id AND active = true;
  
  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Coupon not found or inactive');
  END IF;
  
  v_redemption_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 16));
  v_share_token := md5(random()::text || clock_timestamp()::text || p_device_id);
  v_expires_at := v_coupon.expires_at;
  
  IF p_referred_by_token IS NOT NULL THEN
    SELECT id INTO v_referred_by_id 
    FROM public.coupon_claims 
    WHERE share_token = p_referred_by_token;
  END IF;
  
  INSERT INTO public.coupon_claims (
    coupon_id, device_id, user_email, user_name,
    redemption_code, share_token, expires_at, referred_by
  ) VALUES (
    p_coupon_id, p_device_id, p_user_email, p_user_name,
    v_redemption_code, v_share_token, v_expires_at, v_referred_by_id
  )
  RETURNING id INTO v_claim_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'claim_id', v_claim_id,
    'redemption_code', v_redemption_code,
    'share_token', v_share_token,
    'expires_at', v_expires_at,
    'message', 'Coupon claimed successfully'
  );
END;
$$;

-- Update response comment function
CREATE OR REPLACE FUNCTION public.update_response_comment(
  p_response_id UUID,
  p_comment TEXT,
  p_session_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF length(p_comment) > 500 THEN
    RAISE EXCEPTION 'Comment must be 500 characters or less';
  END IF;

  UPDATE public.survey_responses
  SET comment = p_comment
  WHERE id = p_response_id AND session_id = p_session_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized or response not found';
  END IF;
END;
$$;

-- Claim coupon function
CREATE OR REPLACE FUNCTION public.claim_coupon(
  p_coupon_id UUID,
  p_device_id TEXT,
  p_session_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.engagement_events (session_id, event_type, event_data)
  VALUES (
    p_session_id,
    'coupon_claimed',
    jsonb_build_object('coupon_id', p_coupon_id, 'device_id', p_device_id)
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Insert survey response function
CREATE OR REPLACE FUNCTION public.insert_survey_response(
  p_question_id UUID,
  p_answer TEXT,
  p_session_id TEXT,
  p_comment TEXT DEFAULT NULL,
  p_location_id TEXT DEFAULT NULL,
  p_partner_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_response_id UUID;
BEGIN
  INSERT INTO public.survey_responses (
    question_id, answer, comment, session_id, location_id, partner_id
  ) VALUES (
    p_question_id, p_answer, p_comment, p_session_id, p_location_id, p_partner_id
  ) RETURNING id INTO v_response_id;
  
  RETURN v_response_id;
END;
$$;

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.survey_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON public.analytics_summary
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage roles"
  ON public.user_roles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Locations policies
CREATE POLICY "Partners are viewable by everyone"
  ON public.locations FOR SELECT
  USING (true);

-- WiFi locations policies
CREATE POLICY "WiFi locations are viewable by everyone"
  ON public.wifi_locations FOR SELECT
  USING (true);

-- Coupons policies
CREATE POLICY "Coupons are viewable by everyone"
  ON public.coupons FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users can manage coupons"
  ON public.coupons FOR ALL
  USING (true)
  WITH CHECK (true);

-- Coupon claims policies
CREATE POLICY "Anyone can view active claims"
  ON public.coupon_claims FOR SELECT
  USING (redeemed = false);

CREATE POLICY "Anyone can create claims"
  ON public.coupon_claims FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can update redemptions"
  ON public.coupon_claims FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM partner_staff
    WHERE user_id = auth.uid() AND active = true
  ));

-- Survey questions policies
CREATE POLICY "Survey questions are viewable by everyone"
  ON public.survey_questions FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users can manage questions"
  ON public.survey_questions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Survey responses policies
CREATE POLICY "Anyone can insert survey responses"
  ON public.survey_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view responses"
  ON public.survey_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

-- Engagement events policies
CREATE POLICY "Anyone can insert engagement events"
  ON public.engagement_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view events"
  ON public.engagement_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

-- User emails policies
CREATE POLICY "Anyone can insert user emails"
  ON public.user_emails FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view emails"
  ON public.user_emails FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

CREATE POLICY "Service role can manage emails"
  ON public.user_emails FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role');

-- Partner staff policies
CREATE POLICY "Staff can view their own record"
  ON public.partner_staff FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage staff"
  ON public.partner_staff FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- API keys policies
CREATE POLICY "Admins can manage API keys"
  ON public.api_keys FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage API keys"
  ON public.api_keys FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role');

-- Location traffic policies
CREATE POLICY "Traffic data is viewable by everyone"
  ON public.location_traffic FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert traffic data"
  ON public.location_traffic FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- Analytics summary policies
CREATE POLICY "Admins can view analytics summaries"
  ON public.analytics_summary FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage summaries"
  ON public.analytics_summary FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role');

-- User wallets policies
CREATE POLICY "Users can view their own wallet passes"
  ON public.user_wallets FOR SELECT
  USING (user_id = auth.uid() OR device_id IS NOT NULL);

CREATE POLICY "Service role can insert wallet passes"
  ON public.user_wallets FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- =====================================================
-- 8. CREATE STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('coupon-pdfs', 'coupon-pdfs', true);

-- Storage policies for coupon-pdfs bucket
CREATE POLICY "Coupon PDFs are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coupon-pdfs');

CREATE POLICY "Authenticated users can upload coupon PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'coupon-pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update coupon PDFs"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'coupon-pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete coupon PDFs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'coupon-pdfs' AND auth.uid() IS NOT NULL);
