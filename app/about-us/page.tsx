/**
 * app/about-us/page.tsx
 * About Us page component.
 * Displays information about the KinesisIQ platform and company.
 */

import Footer from "../components/Footer";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="space-y-12">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
              Get Started with KinesisIQ
            </h1>
            <p className="mt-4 text-lg text-zinc-400">
              Transform your physical spaces into AI-powered smart hubs
            </p>
          </div>

          {/* KinesisIQ Platform Information - Rich Text Format */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-50">
                KinesisIQ Platform
              </h2>
              <p className="mt-2 text-base font-medium text-blue-400">
                A Next-Gen AI Platform
              </p>
            </div>

            <div className="space-y-4 text-base leading-relaxed text-zinc-300">
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

          {/* Key Points - Rich Text Format */}
          <div className="space-y-6 text-base leading-relaxed text-zinc-300">
            <p>
              <strong className="font-semibold text-zinc-50">
                KinesisIQ is the brain of the space
              </strong>{" "}
              — delivered as a scalable SaaS platform.
            </p>

            <p>
              We're transforming physical spaces into AI-powered smart hubs that
              connect with people in real time—creating interactive feedback
              zones that evolve each environment into a living entity, revealing
              behaviors and sentiments in the very context where they happen.
            </p>

            <p>
              <strong className="font-semibold text-zinc-50">
                KinesisIQ is an ethical, trust-first AI
              </strong>{" "}
              architected to empower smarter, engaged, and connected communities
              through location-aware insights grounded in moral integrity.
            </p>
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-400">
              Email Us For a Free Trial:
            </p>
            <a
              href="mailto:sales@digitalplacemaking.ca"
              className="inline-flex items-center gap-2 text-lg font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              <Mail className="h-5 w-5" />
              sales@digitalplacemaking.ca
            </a>
          </div>

          {/* Contact Us Button */}
          <div className="pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg bg-blue-500 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-600"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
