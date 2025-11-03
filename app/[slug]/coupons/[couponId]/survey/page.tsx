import { redirect, notFound } from "next/navigation";
import { getSurveyForCoupon, verifyEmailOptIn } from "@/app/actions";
import SurveyContainer from "./components/SurveyContainer";

interface SurveyPageProps {
  params: Promise<{ slug: string; couponId: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function SurveyPage({
  params,
  searchParams,
}: SurveyPageProps) {
  const { slug, couponId } = await params;
  const { email } = await searchParams;

  // Verify email opt-in before allowing access
  if (!email) {
    redirect(`/${slug}/coupons`);
  }

  // Verify email opt-in - if verification fails, still allow access
  // The email in the URL is sufficient - it means they successfully submitted it
  const optInCheck = await verifyEmailOptIn(slug, email);

  if (!optInCheck.valid) {
    // Log warning but don't block - email in URL means submission succeeded
    console.warn("Email opt-in verification warning:", optInCheck.error);
  }

  // Fetch survey for this coupon
  const { survey, error } = await getSurveyForCoupon(slug, couponId);

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-8 py-16">
          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            <p className="font-semibold">Survey not found</p>
            <p className="mt-2 text-sm">
              {error || "This coupon does not have an associated survey."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            {survey.title || "Survey"}
          </h1>
          {survey.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {survey.description}
            </p>
          )}
        </div>

        {/* Survey Container */}
        <SurveyContainer
          survey={survey}
          tenantSlug={slug}
          couponId={couponId}
          email={email}
        />
      </div>
    </div>
  );
}
