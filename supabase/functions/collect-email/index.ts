import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiting by device_id
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

function isRateLimited(deviceId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(deviceId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(deviceId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const sanitized = email.trim().toLowerCase();
  if (sanitized.length > 255) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(sanitized);
}

function sanitizeText(input: string, maxLength: number): string {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>'"&]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .substring(0, maxLength);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { device_id, email_address, subject, email_content, status } = body;

    // Validate required fields
    if (!device_id || typeof device_id !== "string" || device_id.length < 10 || device_id.length > 64) {
      return new Response(
        JSON.stringify({ error: "Invalid device ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!validateEmail(email_address)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit check
    if (isRateLimited(device_id)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize text fields
    const sanitizedSubject = sanitizeText(subject || "Your Exclusive Deals", 200);
    const sanitizedContent = sanitizeText(email_content || "Thank you for joining!", 10000);
    const sanitizedStatus = ["pending", "sent"].includes(status) ? status : "pending";

    // Use service role to insert
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("user_emails")
      .insert({
        device_id: device_id.substring(0, 64),
        email_address: email_address.trim().toLowerCase(),
        subject: sanitizedSubject,
        email_content: sanitizedContent,
        status: sanitizedStatus,
        retries: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error inserting email:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to save email. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in collect-email:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
