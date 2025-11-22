/**
 * app/actions/wallet.ts
 * Server actions for Google Wallet integration.
 * Handles digital coupon pass generation for Google Wallet.
 */

"use server";

import { SignJWT } from "jose";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import type { Coupon } from "@/lib/types/coupon";

/**
 * Wallet Actions
 * Server actions for Google Wallet integration
 */

/**
 * Generates a Google Wallet save URL for a coupon
 * Creates a Google Wallet generic object and returns the Save-to-Wallet URL
 */
export async function generateGoogleWalletPass(
  tenantSlug: string,
  issuedCouponId: string
): Promise<{ saveUrl: string | null; error: string | null }> {
  try {
    // Load Google Wallet credentials from environment
    const issuerId = process.env.NEXT_GOOGLE_WALLET_ISSUER_ID;
    const classId =
      process.env.NEXT_GOOGLE_WALLET_CLASS_ID || "digital_placemaking_coupon";
    const serviceAccountEmail = process.env.NEXT_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.NEXT_GOOGLE_PRIVATE_KEY;

    if (!issuerId || !serviceAccountEmail || !privateKey) {
      return {
        saveUrl: null,
        error: "Google Wallet credentials not configured",
      };
    }

    // Format private key (replace escape sequences with actual newlines)
    // Ensure the key has proper PEM headers if missing
    let formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

    // If the key doesn't have headers, it might be stored as a single line
    // Check if it starts with BEGIN - if not, it might need formatting
    if (!formattedPrivateKey.includes("BEGIN")) {
      // If it's a base64 string without headers, we need to add them
      // But first, let's try to detect if it's already formatted
      formattedPrivateKey = formattedPrivateKey.trim();

      // If still no BEGIN header, the key format might be wrong
      // Try adding standard PKCS#8 headers (most common for Google service accounts)
      if (!formattedPrivateKey.startsWith("-----BEGIN")) {
        // Split into 64-character lines (PEM standard)
        const keyContent = formattedPrivateKey.replace(/\s/g, "");
        const keyLines = keyContent.match(/.{1,64}/g) || [];
        formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${keyLines.join(
          "\n"
        )}\n-----END PRIVATE KEY-----`;
      }
    } else {
      // Key has headers, just ensure proper formatting
      formattedPrivateKey = formattedPrivateKey.trim();
    }

    // Resolve tenant and fetch coupon data
    const supabase = await createClient();
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );

    if (resolveError || !tenantId) {
      return {
        saveUrl: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch issued coupon with related coupon data
    const { data: issuedCoupon, error: issuedError } = await tenantSupabase
      .from("issued_coupons")
      .select("*, coupons(*)")
      .eq("id", issuedCouponId)
      .eq("tenant_id", tenantId)
      .single();

    if (issuedError || !issuedCoupon) {
      return {
        saveUrl: null,
        error: "Issued coupon not found",
      };
    }

    const coupon = issuedCoupon.coupons as Coupon | null;
    if (!coupon) {
      return {
        saveUrl: null,
        error: "Coupon data not found",
      };
    }

    // Fetch tenant branding data
    const { data: tenant } = await tenantSupabase
      .from("tenants")
      .select("name, logo_url")
      .eq("id", tenantId)
      .single();

    // Generate unique object ID
    const objectId = `${issuerId}.coupon${Date.now()}`;

    // Build Google Wallet generic object
    const now = new Date();
    const validUntil = coupon.expires_at
      ? new Date(coupon.expires_at)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Google Wallet generic object structure
    const genericObject: {
      id: string;
      classId: string;
      state: string;
      cardTitle: { defaultValue: { language: string; value: string } };
      header: { defaultValue: { language: string; value: string } };
      subheader?: { defaultValue: { language: string; value: string } };
      barcode?: { type: string; value: string; alternateText?: string };
      validTimeInterval?: { start: { date: string }; end: { date: string } };
      heroImage?: { sourceUri: { uri: string } };
      logo?: { sourceUri: { uri: string } };
      hexBackgroundColor?: string;
      [key: string]: any; // Allow additional Google Wallet properties
    } = {
      id: objectId,
      classId: `${issuerId}.${classId}`,
      state: "active",
      cardTitle: {
        defaultValue: {
          language: "en-US",
          value: coupon.title || "Coupon",
        },
      },
      header: {
        defaultValue: {
          language: "en-US",
          value: coupon.title || "Coupon",
        },
      },
      subheader: {
        defaultValue: {
          language: "en-US",
          value: coupon.discount || "Special Offer",
        },
      },
      logo: tenant?.logo_url
        ? { sourceUri: { uri: tenant.logo_url } }
        : {
            sourceUri: {
              uri: "https://placehold.co/200x200/000000/FFFFFF/png?text=DP",
            },
          },
      heroImage: tenant?.logo_url
        ? { sourceUri: { uri: tenant.logo_url } }
        : {
            sourceUri: {
              uri: "https://placehold.co/600x400/4F46E5/FFFFFF/png?text=Coupon",
            },
          },
      barcode: {
        type: "qrCode",
        value: issuedCoupon.code,
        alternateText: issuedCoupon.code,
      },
      validTimeInterval: {
        start: { date: now.toISOString() },
        end: { date: validUntil.toISOString() },
      },
      textModulesData: [
        {
          header: "Coupon Code",
          body: issuedCoupon.code,
          id: "coupon_code",
        },
        {
          header: "Discount",
          body: coupon.discount || "Special Offer",
          id: "discount",
        },
        {
          header: "Valid Until",
          body: validUntil.toISOString().split("T")[0],
          id: "valid_until",
        },
        ...(coupon.description
          ? [
              {
                header: "Description",
                body: coupon.description,
                id: "description",
              },
            ]
          : []),
      ],
    };

    // Sign JWT for Save-to-Wallet flow
    // Validate and create private key object
    let keyObject;
    try {
      keyObject = crypto.createPrivateKey({
        key: formattedPrivateKey,
        format: "pem",
      });
    } catch (keyError) {
      // If PEM format fails, try different formats
      console.error("Failed to create private key with PEM format:", keyError);

      // Try as DER format (base64 decoded)
      try {
        const keyBuffer = Buffer.from(
          formattedPrivateKey.replace(/\s/g, ""),
          "base64"
        );
        keyObject = crypto.createPrivateKey({
          key: keyBuffer,
          format: "der",
          type: "pkcs8",
        });
      } catch (derError) {
        throw new Error(
          `Invalid private key format. Please ensure your NEXT_GOOGLE_PRIVATE_KEY is a valid PEM or DER formatted key. Original error: ${
            keyError instanceof Error ? keyError.message : String(keyError)
          }`
        );
      }
    }
    const token = await new SignJWT({
      iss: serviceAccountEmail,
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      payload: {
        genericObjects: [genericObject],
      },
    })
      .setProtectedHeader({ alg: "RS256" })
      .sign(keyObject);

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    // Track wallet add in metadata
    const metadata = issuedCoupon.metadata || {};
    metadata.wallet_added = true;
    metadata.wallet_added_at = new Date().toISOString();

    await tenantSupabase
      .from("issued_coupons")
      .update({ metadata })
      .eq("id", issuedCouponId);

    return {
      saveUrl,
      error: null,
    };
  } catch (err) {
    console.error("Error generating Google Wallet pass:", err);
    return {
      saveUrl: null,
      error:
        err instanceof Error ? err.message : "Failed to generate wallet pass",
    };
  }
}
