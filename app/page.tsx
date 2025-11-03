import CouponForm from "./components/CouponForm";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          Tenant Coupons Viewer
        </h1>
        <CouponForm />
      </div>
    </div>
  );
}
