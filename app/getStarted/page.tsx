"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import { Mail, User, MessageSquare, Send, Loader2 } from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";

export default function GetStartedPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitContactForm(
      formData.name,
      formData.email,
      formData.message
    );

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } else {
      setError(result.error || "Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Side - Information */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
                Get Started with KinesisIQ
              </h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Transform your physical spaces into AI-powered smart hubs
              </p>
            </div>

            {/* Platform Information */}
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
                  These profiles are then matched in real-time with partner
                  offers through a proprietary recommendation engine that
                  balances three layers of data: store-specific responses,
                  general customer characteristics, and civic engagement. The
                  result is a unique, adaptive system that learns continuously
                  from interactions, making the recommendations more
                  personalized and valuable over time — a combination that forms
                  the foundation of our intellectual property.
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

            {/* Contact Email */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Email Us For a Free Trial:
              </p>
              <a
                href="mailto:sales@digitalplacemaking.ca"
                className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Mail className="h-5 w-5" />
                sales@digitalplacemaking.ca
              </a>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
                Request Information
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Fill out the form below and we'll get back to you soon.
              </p>

              {success ? (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Thank you! Your message has been sent. We'll be in touch
                    soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50"
                    >
                      <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      Name
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50"
                    >
                      <Mail className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      Business Email
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                      placeholder="your@business.com"
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50"
                    >
                      <MessageSquare className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      Message
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                      placeholder="Tell us about your business and how we can help..."
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
