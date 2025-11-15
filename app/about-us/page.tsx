import Footer from "../components/Footer";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="space-y-12">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
              Get Started with KinesisIQ
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Transform your physical spaces into AI-powered smart hubs
            </p>
          </div>

          {/* KinesisIQ Platform Information */}
          <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
                KinesisIQ Platform
              </h2>
              <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                A Next-Gen AI Platform
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <p>
                Our system uses natural language processing (NLP) and advanced
                machine learning to transform short survey responses into
                dynamic customer profiles that go far beyond spreadsheets or
                static analytics. Unlike traditional tools that only crunch
                numbers, we interpret open-ended text using neural networks to
                uncover intent, preferences, and engagement signals.
              </p>
              <p>
                These profiles are then matched in real-time with partner offers
                through a proprietary recommendation engine that balances three
                layers of data: store-specific responses, general customer
                characteristics, and civic engagement. The result is a unique,
                adaptive system that learns continuously from interactions,
                making the recommendations more personalized and valuable over
                time — a combination that forms the foundation of our
                intellectual property.
              </p>
            </div>
          </div>

          {/* Key Points */}
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                <strong className="font-semibold text-black dark:text-zinc-50">
                  KinesisIQ is the brain of the space
                </strong>{" "}
                — delivered as a scalable SaaS platform.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                We're transforming physical spaces into AI-powered smart hubs
                that connect with people in real time—creating interactive
                feedback zones that evolve each environment into a living
                entity, revealing behaviors and sentiments in the very context
                where they happen.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                <strong className="font-semibold text-black dark:text-zinc-50">
                  KinesisIQ is an ethical, trust-first AI
                </strong>{" "}
                architected to empower smarter, engaged, and connected
                communities through location-aware insights grounded in moral
                integrity.
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Email Us For a Free Trial:
            </p>
            <a
              href="mailto:sales@digitalplacemaking.ca"
              className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              sales@digitalplacemaking.ca
            </a>
            <div className="mt-4">
              <a
                href="/contact"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
