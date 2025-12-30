/**
 * app/contact/page.tsx
 * Contact page component.
 * Provides a contact form for users to send messages to the platform.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ScrollReveal } from "../components/ui/scroll-reveal";
import { Mail, User, MessageSquare, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { submitContactForm } from "@/app/actions/contact";

export default function ContactPage() {
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
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <Navbar />
      
      {/* Subtle background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
      </div>
      
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative border-b border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-zinc-300 leading-relaxed"
            >
              Get in touch to learn more about KinesisIQ
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-zinc-400 max-w-2xl mx-auto"
            >
              Fill out the form below and we'll get back to you soon.
            </motion.p>
          </div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl py-20 relative z-10">
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-sm p-8 shadow-xl">
          <p className="mb-6 text-sm text-zinc-400">
            Want to learn more about KinesisIQ?{" "}
            <Link
              href="/about-us"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: "#f16609" }}
            >
              Visit our About page
            </Link>
            .
          </p>

          {success ? (
            <div className="mt-6 rounded-lg border border-green-800 bg-green-900/20 p-4">
              <p className="text-sm font-medium text-green-200">
                Thank you! Your message has been sent. We'll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-50"
                >
                  <User className="h-4 w-4 text-zinc-400" />
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
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-50"
                >
                  <Mail className="h-4 w-4 text-zinc-400" />
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
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="your@business.com"
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-50"
                >
                  <MessageSquare className="h-4 w-4 text-zinc-400" />
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
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                  placeholder="Tell us about your business and how we can help..."
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#f16609" }}
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

      <Footer />
    </div>
  );
}
