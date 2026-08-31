/**
 * app/[slug]/admin/questions/page.tsx
 * Legacy route — redirects to Surveys tab.
 */

import { redirect } from "next/navigation";

interface QuestionsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const { slug } = await params;
  redirect(`/${slug}/admin/surveys`);
}
