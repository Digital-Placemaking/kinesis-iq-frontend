import { redirect } from "next/navigation";
import { getTenantBySlug } from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import SurveyCompletion from "./components/SurveyCompletion";

interface CompletedPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompletedPage({ params }: CompletedPageProps) {
  const { slug } = await params;

  // Get tenant data
  const { tenant: tenantData, error: tenantError } = await getTenantBySlug(
    slug
  );

  if (tenantError || !tenantData) {
    // Redirect back to tenant landing page if tenant not found
    redirect(`/${slug}`);
  }

  const tenant = toTenantDisplay(tenantData);

  return <SurveyCompletion tenant={tenant} />;
}
