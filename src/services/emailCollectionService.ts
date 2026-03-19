import { supabase } from "@/integrations/supabase/client";

interface CollectEmailParams {
  device_id: string;
  email_address: string;
  subject?: string;
  email_content?: string;
  status?: "pending" | "sent";
}

interface CollectEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Securely collect an email via the collect-email edge function.
 * This avoids direct client-side inserts into user_emails table.
 */
export async function collectEmail(params: CollectEmailParams): Promise<CollectEmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke("collect-email", {
      body: {
        device_id: params.device_id,
        email_address: params.email_address,
        subject: params.subject || "Your Exclusive Deals",
        email_content: params.email_content || "Thank you for joining!",
        status: params.status || "pending",
      },
    });

    if (error) {
      console.error("Error calling collect-email:", error.message);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Unexpected error in collectEmail:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
