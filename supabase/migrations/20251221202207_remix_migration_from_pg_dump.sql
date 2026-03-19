CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: check_email_rate_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_email_rate_limit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many emails from this device in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.user_emails
  WHERE device_id = NEW.device_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 5 emails per hour per device';
  END IF;
  
  -- Validate email format
  IF NEW.email_address !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email address format';
  END IF;
  
  -- Limit email content length to prevent abuse
  IF LENGTH(NEW.email_content) > 10000 THEN
    RAISE EXCEPTION 'Email content exceeds maximum length of 10000 characters';
  END IF;
  
  RETURN NEW;
END;
$_$;


--
-- Name: check_engagement_rate_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_engagement_rate_limit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many events from this session in the last minute
  SELECT COUNT(*) INTO recent_count
  FROM public.engagement_events
  WHERE session_id = NEW.session_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 20 engagement events per minute per session';
  END IF;
  
  -- Validate event_type is not empty
  IF NEW.event_type IS NULL OR TRIM(NEW.event_type) = '' THEN
    RAISE EXCEPTION 'Event type cannot be empty';
  END IF;
  
  -- Validate session_id format (basic check)
  IF LENGTH(NEW.session_id) < 10 THEN
    RAISE EXCEPTION 'Invalid session ID format';
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: check_survey_rate_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_survey_rate_limit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many responses from this session in the last 5 minutes
  SELECT COUNT(*) INTO recent_count
  FROM public.survey_responses
  WHERE session_id = NEW.session_id
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 10 survey responses per 5 minutes per session';
  END IF;
  
  -- Validate answer is not empty
  IF NEW.answer IS NULL OR TRIM(NEW.answer) = '' THEN
    RAISE EXCEPTION 'Survey answer cannot be empty';
  END IF;
  
  -- Limit comment length
  IF NEW.comment IS NOT NULL AND LENGTH(NEW.comment) > 500 THEN
    RAISE EXCEPTION 'Comment exceeds maximum length of 500 characters';
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: claim_coupon(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_coupon(p_coupon_id uuid, p_device_id text, p_session_id text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: claim_coupon_with_share(uuid, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_coupon_with_share(p_coupon_id uuid, p_device_id text, p_user_email text DEFAULT NULL::text, p_user_name text DEFAULT NULL::text, p_referred_by_token text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: get_location_analytics(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_location_analytics(location_slug text) RETURNS TABLE(total_responses bigint, positive_sentiment bigint, neutral_sentiment bigint, negative_sentiment bigint, total_visits bigint)
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: insert_survey_response(uuid, text, text, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_survey_response(p_question_id uuid, p_answer text, p_session_id text, p_comment text DEFAULT NULL::text, p_location_id text DEFAULT NULL::text, p_partner_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: log_coupon_redemption(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_coupon_redemption() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.redeemed = true AND OLD.redeemed = false THEN
    INSERT INTO public.coupon_audit_log (
      coupon_claim_id,
      action,
      actor_id,
      actor_email,
      metadata
    ) VALUES (
      NEW.id,
      'redemption',
      NEW.redeemed_by,
      NEW.user_email,
      jsonb_build_object(
        'redemption_code', NEW.redemption_code,
        'redeemed_at', NEW.redeemed_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: redeem_coupon_qr(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.redeem_coupon_qr(p_redemption_code text, p_staff_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: set_question_active(uuid, uuid, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_question_active(p_question_id uuid, p_user_id uuid, p_active boolean) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT has_role(p_user_id, 'admin'::app_role) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  -- Set the active status
  UPDATE public.survey_questions
  SET active = p_active
  WHERE id = p_question_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Question not found');
  END IF;
  
  RETURN jsonb_build_object('success', true, 'active', p_active);
END;
$$;


--
-- Name: toggle_question_active(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.toggle_question_active(p_question_id uuid, p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_new_active boolean;
BEGIN
  -- Check if user is admin
  SELECT has_role(p_user_id, 'admin'::app_role) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  -- Toggle the active status
  UPDATE public.survey_questions
  SET active = NOT active
  WHERE id = p_question_id
  RETURNING active INTO v_new_active;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Question not found');
  END IF;
  
  RETURN jsonb_build_object('success', true, 'active', v_new_active);
END;
$$;


--
-- Name: track_referral_conversion(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_referral_conversion(p_referral_code text, p_referred_email text, p_referred_device_id text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_referral_id UUID;
BEGIN
  -- Check if referral code exists
  IF NOT EXISTS (SELECT 1 FROM public.user_emails WHERE referral_code = p_referral_code) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid referral code');
  END IF;
  
  -- Insert referral record
  INSERT INTO public.referrals (
    referrer_email,
    referrer_device_id,
    referred_email,
    referred_device_id,
    referral_code,
    converted,
    converted_at
  )
  SELECT 
    email_address,
    device_id,
    p_referred_email,
    p_referred_device_id,
    p_referral_code,
    true,
    now()
  FROM public.user_emails
  WHERE referral_code = p_referral_code
  RETURNING id INTO v_referral_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral_id,
    'message', 'Referral tracked successfully'
  );
END;
$$;


--
-- Name: update_response_comment(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_response_comment(p_response_id uuid, p_comment text, p_session_id text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: analytics_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    partner_id uuid,
    date date NOT NULL,
    hour integer,
    total_visits integer DEFAULT 0,
    unique_sessions integer DEFAULT 0,
    survey_responses integer DEFAULT 0,
    positive_sentiment integer DEFAULT 0,
    neutral_sentiment integer DEFAULT 0,
    negative_sentiment integer DEFAULT 0,
    coupon_claims integer DEFAULT 0,
    coupon_redemptions integer DEFAULT 0,
    avg_session_duration_seconds integer DEFAULT 0,
    bounce_rate numeric DEFAULT 0.00,
    computed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    key_hash text NOT NULL,
    location_id uuid,
    active boolean DEFAULT true,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: coupon_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_claim_id uuid,
    action text NOT NULL,
    actor_id uuid,
    actor_email text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: coupon_claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_claims (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_id uuid NOT NULL,
    device_id text NOT NULL,
    user_email text,
    user_name text,
    redemption_code text NOT NULL,
    share_token text,
    claimed_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    redeemed boolean DEFAULT false,
    redeemed_at timestamp with time zone,
    redeemed_by uuid,
    referred_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    user_id uuid
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    discount text NOT NULL,
    code text,
    partner_id uuid,
    expires_at timestamp with time zone,
    pdf_url text,
    share_enabled boolean DEFAULT true,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    valid_days text[],
    valid_time_start time without time zone,
    valid_time_end time without time zone,
    image_url text
);


--
-- Name: coupons_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.coupons_public WITH (security_invoker='true') AS
 SELECT id,
    partner_id,
    title,
    description,
    discount,
    expires_at,
    created_at
   FROM public.coupons
  WHERE (active = true);


--
-- Name: engagement_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.engagement_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    event_type text NOT NULL,
    event_data jsonb DEFAULT '{}'::jsonb,
    coupon_id uuid,
    partner_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: location_traffic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_traffic (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_id uuid,
    device_count integer DEFAULT 0 NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    address text,
    city text,
    postal_code text,
    latitude numeric,
    longitude numeric,
    client_name text,
    parent_location_id uuid,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: partner_staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    partner_id uuid,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    username text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referrer_email text NOT NULL,
    referrer_device_id text,
    referred_email text,
    referred_device_id text,
    referral_code text NOT NULL,
    utm_source text,
    created_at timestamp with time zone DEFAULT now(),
    converted boolean DEFAULT false,
    converted_at timestamp with time zone
);


--
-- Name: user_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_emails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id text NOT NULL,
    email_address text NOT NULL,
    subject text NOT NULL,
    email_content text NOT NULL,
    status text DEFAULT 'pending'::text,
    retries integer DEFAULT 0,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    referral_code text DEFAULT SUBSTRING(md5(((random())::text || (clock_timestamp())::text)) FROM 1 FOR 8)
);


--
-- Name: referral_stats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.referral_stats WITH (security_invoker='true') AS
 SELECT ue.email_address AS referrer_email,
    ue.referral_code,
    count(r.id) AS total_referrals,
    count(r.id) FILTER (WHERE (r.converted = true)) AS successful_referrals,
    max(r.created_at) AS last_referral_date
   FROM (public.user_emails ue
     LEFT JOIN public.referrals r ON ((r.referral_code = ue.referral_code)))
  GROUP BY ue.email_address, ue.referral_code
 HAVING (count(r.id) > 0)
  ORDER BY (count(r.id)) DESC;


--
-- Name: survey_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    text text NOT NULL,
    type text DEFAULT 'sentiment'::text NOT NULL,
    options jsonb DEFAULT '[]'::jsonb,
    "order" integer DEFAULT 1 NOT NULL,
    partner_id uuid,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    survey_id uuid
);


--
-- Name: survey_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid,
    answer text,
    comment text,
    session_id text,
    location_id text,
    partner_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: surveys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.surveys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    type text DEFAULT 'general'::text NOT NULL,
    order_index integer DEFAULT 1 NOT NULL,
    partner_id uuid,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_wallets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    device_id text NOT NULL,
    coupon_id uuid NOT NULL,
    passkit_coupon_id text NOT NULL,
    platform text NOT NULL,
    pass_url text NOT NULL,
    passkit_status text DEFAULT 'issued'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: wifi_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wifi_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text,
    city text,
    latitude numeric,
    longitude numeric,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_summary analytics_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_summary
    ADD CONSTRAINT analytics_summary_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_key_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: coupon_audit_log coupon_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_audit_log
    ADD CONSTRAINT coupon_audit_log_pkey PRIMARY KEY (id);


--
-- Name: coupon_claims coupon_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_claims
    ADD CONSTRAINT coupon_claims_pkey PRIMARY KEY (id);


--
-- Name: coupon_claims coupon_claims_redemption_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_claims
    ADD CONSTRAINT coupon_claims_redemption_code_key UNIQUE (redemption_code);


--
-- Name: coupon_claims coupon_claims_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_claims
    ADD CONSTRAINT coupon_claims_share_token_key UNIQUE (share_token);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: engagement_events engagement_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_events
    ADD CONSTRAINT engagement_events_pkey PRIMARY KEY (id);


--
-- Name: location_traffic location_traffic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_traffic
    ADD CONSTRAINT location_traffic_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: locations locations_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_slug_key UNIQUE (slug);


--
-- Name: partner_staff partner_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_staff
    ADD CONSTRAINT partner_staff_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referral_code_key UNIQUE (referral_code);


--
-- Name: survey_questions survey_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_pkey PRIMARY KEY (id);


--
-- Name: survey_responses survey_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_pkey PRIMARY KEY (id);


--
-- Name: surveys surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_pkey PRIMARY KEY (id);


--
-- Name: user_emails user_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_emails
    ADD CONSTRAINT user_emails_pkey PRIMARY KEY (id);


--
-- Name: user_emails user_emails_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_emails
    ADD CONSTRAINT user_emails_referral_code_key UNIQUE (referral_code);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_wallets user_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_wallets
    ADD CONSTRAINT user_wallets_pkey PRIMARY KEY (id);


--
-- Name: wifi_locations wifi_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wifi_locations
    ADD CONSTRAINT wifi_locations_pkey PRIMARY KEY (id);


--
-- Name: idx_coupon_claims_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupon_claims_user_id ON public.coupon_claims USING btree (user_id);


--
-- Name: idx_referrals_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_code ON public.referrals USING btree (referral_code);


--
-- Name: idx_referrals_converted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_converted ON public.referrals USING btree (converted);


--
-- Name: idx_referrals_referrer_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referrer_email ON public.referrals USING btree (referrer_email);


--
-- Name: idx_survey_questions_survey_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_survey_questions_survey_id ON public.survey_questions USING btree (survey_id);


--
-- Name: idx_surveys_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_surveys_active ON public.surveys USING btree (active);


--
-- Name: idx_surveys_partner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_surveys_partner_id ON public.surveys USING btree (partner_id);


--
-- Name: coupon_claims coupon_redemption_audit_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER coupon_redemption_audit_trigger AFTER UPDATE ON public.coupon_claims FOR EACH ROW EXECUTE FUNCTION public.log_coupon_redemption();


--
-- Name: user_emails email_rate_limit_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER email_rate_limit_trigger BEFORE INSERT ON public.user_emails FOR EACH ROW EXECUTE FUNCTION public.check_email_rate_limit();


--
-- Name: engagement_events engagement_rate_limit_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER engagement_rate_limit_trigger BEFORE INSERT ON public.engagement_events FOR EACH ROW EXECUTE FUNCTION public.check_engagement_rate_limit();


--
-- Name: survey_responses survey_rate_limit_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER survey_rate_limit_trigger BEFORE INSERT ON public.survey_responses FOR EACH ROW EXECUTE FUNCTION public.check_survey_rate_limit();


--
-- Name: analytics_summary update_analytics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON public.analytics_summary FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: coupons update_coupons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: locations update_locations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: survey_questions update_questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.survey_questions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: surveys update_surveys_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_wallets update_wallets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.user_wallets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: analytics_summary analytics_summary_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_summary
    ADD CONSTRAINT analytics_summary_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.locations(id);


--
-- Name: api_keys api_keys_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: coupon_audit_log coupon_audit_log_coupon_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_audit_log
    ADD CONSTRAINT coupon_audit_log_coupon_claim_id_fkey FOREIGN KEY (coupon_claim_id) REFERENCES public.coupon_claims(id);


--
-- Name: coupon_claims coupon_claims_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_claims
    ADD CONSTRAINT coupon_claims_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: coupon_claims coupon_claims_redeemed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_claims
    ADD CONSTRAINT coupon_claims_redeemed_by_fkey FOREIGN KEY (redeemed_by) REFERENCES auth.users(id);


--
-- Name: coupon_claims coupon_claims_referred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_claims
    ADD CONSTRAINT coupon_claims_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.coupon_claims(id);


--
-- Name: coupon_claims coupon_claims_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_claims
    ADD CONSTRAINT coupon_claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: coupons coupons_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.locations(id);


--
-- Name: engagement_events engagement_events_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_events
    ADD CONSTRAINT engagement_events_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: engagement_events engagement_events_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_events
    ADD CONSTRAINT engagement_events_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.locations(id);


--
-- Name: location_traffic location_traffic_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_traffic
    ADD CONSTRAINT location_traffic_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: locations locations_parent_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_parent_location_id_fkey FOREIGN KEY (parent_location_id) REFERENCES public.locations(id);


--
-- Name: partner_staff partner_staff_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_staff
    ADD CONSTRAINT partner_staff_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.locations(id);


--
-- Name: partner_staff partner_staff_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_staff
    ADD CONSTRAINT partner_staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: survey_questions survey_questions_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.locations(id);


--
-- Name: survey_questions survey_questions_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id);


--
-- Name: survey_responses survey_responses_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.locations(id);


--
-- Name: survey_responses survey_responses_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.survey_questions(id);


--
-- Name: surveys surveys_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.locations(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_wallets user_wallets_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_wallets
    ADD CONSTRAINT user_wallets_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: user_wallets user_wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_wallets
    ADD CONSTRAINT user_wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: locations Admins can delete locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete locations" ON public.locations FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: survey_questions Admins can delete questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete questions" ON public.survey_questions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: locations Admins can insert locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert locations" ON public.locations FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: survey_questions Admins can insert questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert questions" ON public.survey_questions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: api_keys Admins can manage API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage API keys" ON public.api_keys USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: coupons Admins can manage coupons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage coupons" ON public.coupons USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: partner_staff Admins can manage staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage staff" ON public.partner_staff USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: surveys Admins can manage surveys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage surveys" ON public.surveys USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: locations Admins can update locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update locations" ON public.locations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: survey_questions Admins can update questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update questions" ON public.survey_questions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: coupon_claims Admins can view all claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all claims" ON public.coupon_claims FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: survey_questions Admins can view all questions including inactive; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all questions including inactive" ON public.survey_questions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: referrals Admins can view all referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all referrals" ON public.referrals FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: analytics_summary Admins can view analytics summaries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view analytics summaries" ON public.analytics_summary FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: coupon_audit_log Admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit logs" ON public.coupon_audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_emails Admins can view emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view emails" ON public.user_emails FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: engagement_events Admins can view events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view events" ON public.engagement_events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: user_emails Admins can view referral stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view referral stats" ON public.user_emails FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: survey_responses Admins can view responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view responses" ON public.survey_responses FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: coupon_claims Anyone can create claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create claims" ON public.coupon_claims FOR INSERT WITH CHECK (true);


--
-- Name: engagement_events Anyone can insert engagement events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert engagement events" ON public.engagement_events FOR INSERT WITH CHECK (true);


--
-- Name: referrals Anyone can insert referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert referrals" ON public.referrals FOR INSERT WITH CHECK (true);


--
-- Name: survey_responses Anyone can insert survey responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert survey responses" ON public.survey_responses FOR INSERT WITH CHECK (true);


--
-- Name: user_emails Anyone can insert user emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert user emails" ON public.user_emails FOR INSERT WITH CHECK (true);


--
-- Name: coupon_claims Authenticated users view own claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users view own claims" ON public.coupon_claims FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.user_emails ue
  WHERE ((ue.device_id = coupon_claims.device_id) AND (ue.email_address = auth.email())))) OR (user_email = auth.email())));


--
-- Name: user_emails Authenticated users view own email records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users view own email records" ON public.user_emails FOR SELECT TO authenticated USING ((email_address = auth.email()));


--
-- Name: user_wallets Authenticated users view own wallet passes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users view own wallet passes" ON public.user_wallets FOR SELECT TO authenticated USING (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())));


--
-- Name: coupons Coupons are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Coupons are viewable by everyone" ON public.coupons FOR SELECT USING ((active = true));


--
-- Name: locations Partners are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners are viewable by everyone" ON public.locations FOR SELECT USING (true);


--
-- Name: location_traffic Service role can insert traffic data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert traffic data" ON public.location_traffic FOR INSERT WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: user_wallets Service role can insert wallet passes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert wallet passes" ON public.user_wallets FOR INSERT WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: api_keys Service role can manage API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage API keys" ON public.api_keys USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: user_emails Service role can manage emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage emails" ON public.user_emails USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: user_roles Service role can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage roles" ON public.user_roles USING (true) WITH CHECK (true);


--
-- Name: analytics_summary Service role can manage summaries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage summaries" ON public.analytics_summary USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: coupon_claims Staff can update redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can update redemptions" ON public.coupon_claims FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.partner_staff
  WHERE ((partner_staff.user_id = auth.uid()) AND (partner_staff.active = true)))));


--
-- Name: coupon_claims Staff can view claims for redemption; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view claims for redemption" ON public.coupon_claims FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.partner_staff
  WHERE ((partner_staff.user_id = auth.uid()) AND (partner_staff.active = true)))));


--
-- Name: partner_staff Staff can view their own record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view their own record" ON public.partner_staff FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: survey_questions Survey questions are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Survey questions are viewable by everyone" ON public.survey_questions FOR SELECT USING ((active = true));


--
-- Name: surveys Surveys are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Surveys are viewable by everyone" ON public.surveys FOR SELECT USING ((active = true));


--
-- Name: location_traffic Traffic data is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Traffic data is viewable by everyone" ON public.location_traffic FOR SELECT USING (true);


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles only" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: wifi_locations WiFi locations are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "WiFi locations are viewable by everyone" ON public.wifi_locations FOR SELECT USING (true);


--
-- Name: analytics_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: coupon_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupon_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: coupon_claims; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupon_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: engagement_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;

--
-- Name: location_traffic; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.location_traffic ENABLE ROW LEVEL SECURITY;

--
-- Name: locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

--
-- Name: partner_staff; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partner_staff ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: survey_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: survey_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: surveys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

--
-- Name: user_emails; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_wallets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

--
-- Name: wifi_locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wifi_locations ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;