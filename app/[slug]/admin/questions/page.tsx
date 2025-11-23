/**
 * app/[slug]/admin/questions/page.tsx
 * Questions admin page.
 * Allows administrators to manage survey questions for their tenant.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireBusinessOwnerAccess } from "@/lib/auth/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import QuestionsClient from "./components/QuestionsClient";

interface QuestionsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const { slug } = await params;

  // Require business owner access
  const { user, owner } = await requireBusinessOwnerAccess(
    slug,
    `/${slug}/admin/login?error=unauthorized`
  );

  const userRole = owner.role;

  // Redirect staff users to coupons page (they can only access issued coupons)
  if (userRole === "staff") {
    redirect(`/${slug}/admin/coupons`);
  }

  const supabase = await createClient();

  // Resolve tenant slug to UUID
  const { data: tenantId } = await supabase.rpc("resolve_tenant", {
    slug_input: slug,
  });

  if (!tenantId) {
    redirect(`/${slug}/admin/login?error=tenant_not_found`);
  }

  const tenantSupabase = await createTenantClient(tenantId);

  // Fetch survey questions
  const { data: questions, error } = await tenantSupabase
    .from("survey_questions")
    .select("*")
    .order("order_index", { ascending: true });

  // Map question types to display names
  const questionTypeNames: Record<string, string> = {
    sentiment: "Sentiment Question",
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
    <QuestionsClient
      questions={questions || []}
      tenantSlug={slug}
      questionTypeNames={questionTypeNames}
    />
  );
}
