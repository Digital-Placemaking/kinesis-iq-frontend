/**
 * app/admin/questions/page.tsx
 * Questions admin page.
 * Allows administrators to manage survey questions for their tenant.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import AdminLayout from "../components/AdminLayout";
import QuestionsClient from "./components/QuestionsClient";

export default async function QuestionsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Find user's tenant and role
  const { data: staff } = await supabase
    .from("staff")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!staff || staff.length === 0) {
    redirect("/admin/login?error=no_tenant");
  }

  const tenantId = staff[0].tenant_id;
  const userRole = staff[0].role;

  // Redirect staff users to coupons page (they can only access issued coupons)
  if (userRole === "staff") {
    redirect("/admin/coupons");
  }

  const tenantSupabase = await createTenantClient(tenantId);

  // Get tenant slug for actions
  const { data: tenant } = await tenantSupabase
    .from("tenants")
    .select("slug")
    .eq("id", tenantId)
    .maybeSingle();

  if (!tenant) {
    redirect("/admin/login?error=tenant_not_found");
  }

  // Fetch survey questions
  const { data: questions, error } = await tenantSupabase
    .from("survey_questions")
    .select("*")
    .order("order_index", { ascending: true });

  // Map question types to display names
  const questionTypeNames: Record<string, string> = {
    sentiment: "Sentiment",
    multiple_choice: "Multiple Choice",
    single_choice: "Single Choice",
    ranked_choice: "Ranked Choice",
    likert_5: "Likert Scale (5)",
    likert_7: "Likert Scale (7)",
    nps: "NPS",
    rating_5: "Rating (5)",
    yes_no: "Yes/No",
    open_text: "Open Text",
    numeric: "Numeric",
    slider: "Slider",
    date: "Date",
    time: "Time",
  };

  return (
    <AdminLayout userRole={userRole}>
      <QuestionsClient
        questions={questions || []}
        tenantSlug={tenant.slug}
        questionTypeNames={questionTypeNames}
      />
    </AdminLayout>
  );
}
