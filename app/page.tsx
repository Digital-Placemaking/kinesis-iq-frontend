import type { Metadata } from "next";
import Footer from "./components/Footer";
import AuthCallbackHandler from "./components/AuthCallbackHandler";

export const metadata: Metadata = {
  title: "Digital Placemaking",
  description: "Digital Placemaking",
};

const PREVIEW_IMAGE_URL = "https://placehold.co/1600x1200";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AuthCallbackHandler />
      {/* Hero Section - Split Layout */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
        {/* Decorative gradient blur */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[50vh] w-[50vh] rounded-full bg-blue-600/10 blur-3xl dark:bg-blue-500/10" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:pr-0">
          {/* Left Side - Main Content */}
          <div className="flex flex-col justify-center space-y-8 py-12 lg:py-24">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 shadow-sm ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-900/60 dark:ring-zinc-800">
                  <img
                    src="/dp-logo.png"
                    alt="Digital Placemaking"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  by Digital Placemaking
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-6xl lg:text-7xl">
                KinesisIQ
              </h1>
              <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-2xl">
                Reading the pulse of humanity—turning insight into foresight.
              </p>
              <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                KinesisIQ is a Conversational Intelligence and Predictive
                Insight Platform that transforms real-world interactions into
                foresight.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="/contact"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Get started
              </a>
              <a
                href="#what-is-kinesisiq"
                className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Learn more →
              </a>
            </div>
          </div>

          {/* Right Side - Preview Image */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="sticky top-0">
              <img
                src={PREVIEW_IMAGE_URL}
                alt="KinesisIQ Platform Preview"
                className="h-[400px] w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Details Section - Scrollable */}
      <section className="min-h-screen bg-white py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl space-y-16 px-8">
          {/* KinesisIQ Description */}
          <div id="what-is-kinesisiq" className="scroll-mt-24 space-y-6">
            <h2 className="text-3xl font-bold text-black dark:text-zinc-50 sm:text-4xl">
              What is KinesisIQ?
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-xl">
              <p>
                KinesisIQ is a Conversational Intelligence and Predictive
                Insight Platform that transforms real-world interactions into
                foresight.
              </p>
              <p>
                By capturing and analyzing engagement across a network of
                businesses, communities, and users, KinesisIQ applies
                probabilistic modeling to predict how groups of people will
                think, move, and respond — locally or across regions.
              </p>
              <p>
                It connects conversation, behavior, and place into one dynamic
                system of intelligence, empowering organizations to see emerging
                patterns, anticipate change, and act with confidence before the
                future unfolds.
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-4 border-t border-zinc-200 pt-16 dark:border-zinc-800">
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
