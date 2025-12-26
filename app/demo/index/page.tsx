"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Smartphone, BarChart3, ArrowRight } from "lucide-react";

/**
 * Demo Index Page
 * Landing page for demo experiences - links to mobile flow and reporting demo
 */
export default function DemoIndexPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Explore KinesisIQ
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed">
              Experience our platform through interactive demos
            </p>
          </div>
        </div>
      </section>

      {/* Demo Options */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
            {/* Mobile Flow Demo */}
            <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-lg bg-blue-500/20 p-3">
                    <Smartphone className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">Mobile Survey Experience</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                  Experience the complete mobile survey flow from landing page to completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-zinc-300 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    Interactive survey questions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    Coupon redemption flow
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    Mobile-optimized UI/UX
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Link href="/demo">
                    Try Mobile Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Reporting Demo */}
            <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                  </div>
                  <CardTitle className="text-white">Data & Analytics Dashboard</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                  Explore our reporting and analytics capabilities with real-time insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-zinc-300 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">•</span>
                    Real-time metrics & KPIs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">•</span>
                    Engagement funnels & trends
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">•</span>
                    Location-based analytics
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  <Link href="/demo/reporting">
                    View Analytics Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-zinc-400 mb-4">
              Both demos use simulated data to showcase KinesisIQ's capabilities
            </p>
            <Button
              asChild
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

