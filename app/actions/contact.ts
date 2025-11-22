/**
 * app/actions/contact.ts
 * Server actions for contact form submissions.
 * Handles sending contact form emails via Resend.
 */

"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TARGET_EMAIL = "sales@digitalplacemaking.ca";

export async function submitContactForm(
  name: string,
  email: string,
  message: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return {
        success: false,
        error: "Email service is not configured. Please contact support.",
      };
    }

    // Send email to sales team
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: TARGET_EMAIL,
      replyTo: email,
      subject: `New Contact Form Submission from ${name} (${email})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">KinesisIQ - New Contact Form Submission</h2>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin-bottom: 15px;"><strong>From:</strong> ${name} &lt;<a href="mailto:${email}" style="color: #2563eb;">${email}</a>&gt;</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; margin-top: 10px; background-color: white; padding: 15px; border-radius: 4px;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Reply to this email to respond directly to ${name} at ${email}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error sending email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
