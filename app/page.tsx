import ScrollArrow from "./components/ScrollArrow";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Viewport */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
            Digital Placemaking
          </h1>
          <div className="mt-6 flex justify-center">
            <ScrollArrow />
          </div>
        </div>
      </section>

      {/* Details Section - Scrollable */}
      <section className="min-h-screen bg-white py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl space-y-16 px-8">
          {/* Tagline */}
          <div className="space-y-4">
            <p className="text-2xl leading-relaxed text-zinc-800 dark:text-zinc-200 sm:text-3xl">
              Reading the pulse of humanity—turning insight into foresight.
            </p>
            <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-2xl">
              It lets organizations act before change hits, turning real-world
              behavior into a strategic advantage.
            </p>
          </div>

          {/* Testimonials */}
          {/* TODO: when we add more testimonials, we should add a carousel component */}
          <div className="space-y-8 border-t border-zinc-200 pt-16 dark:border-zinc-800">
            <div className="group rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <div className="mb-4 text-2xl text-zinc-400 dark:text-zinc-600">
                "
              </div>
              <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                ...your technology, it looks fantastic.
              </p>
              <div className="mt-6">
                <p className="font-semibold text-black dark:text-zinc-50">
                  Sharon Sukhdeo
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Program Manager, Ontario Centre of Innovation
                </p>
              </div>
            </div>

            <div className="group rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <div className="mb-4 text-2xl text-zinc-400 dark:text-zinc-600">
                "
              </div>
              <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                We had a chance to review Digital Placemaking and we're
                genuinely impressed by what you're building. The vision of
                transforming physical spaces into AI smart hubs—making the
                physical world as measurable and responsive as the digital
                one—is a sophisticated approach to bridging the gap between our
                physical and digital environments.
              </p>
              <div className="mt-6">
                <p className="font-semibold text-black dark:text-zinc-50">
                  Tessa Clarance
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Chief of Staff, GetFresh Ventures
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
