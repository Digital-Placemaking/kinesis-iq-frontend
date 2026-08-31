/**
 * app/[slug]/admin/surveys/page.tsx
 * Redirects to unified admin with the Surveys tab active.
 */

import { redirect } from "next/navigation";
import { requireBusinessOwnerAccess } from "@/lib/auth/server";

interface SurveysPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SurveysPage({ params }: SurveysPageProps) {
  const { slug } = await params;

  const { owner } = await requireBusinessOwnerAccess(
    slug,
    `/${slug}/admin/login?error=unauthorized`
  );

  if (owner.role === "staff") {
    redirect(`/${slug}/admin/coupons`);
  }

  redirect(`/${slug}/admin?tab=surveys`);
}
