"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * PublicLayout - Conditionally renders Navbar and Footer for public marketing pages only
 *
 * Navbar is ONLY for public marketing pages (contains links to /how-it-works, /about-us, etc.)
 * Footer is also added to public pages, but tenant/admin pages manually import Footer themselves
 *
 * Routes that get Navbar + Footer:
 * - / (landing page)
 * - /how-it-works
 * - /about-us
 * - /contact
 * - /demo/* (demo pages)
 * - /not-found (404 page)
 *
 * Routes that DON'T get Navbar/Footer (they handle their own):
 * - /[slug]/* (tenant routes - they manually import Footer, no Navbar)
 * - /[slug]/admin/* (admin routes - they have their own navigation)
 * - /admin/* (global admin routes)
 * - /auth/* (auth routes)
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Explicit list of public marketing pages that should have Navbar + Footer
  // These are the ONLY pages that get the public Navbar (which has marketing links)
  const publicMarketingPages = [
    "/", // Landing page
    "/how-it-works",
    "/about-us",
    "/contact",
    "/not-found",
  ];

  // Demo pages (all routes starting with /demo)
  const isDemoPage = pathname.startsWith("/demo");

  // Check if this is a public marketing page
  const isPublicMarketingPage =
    publicMarketingPages.includes(pathname) || isDemoPage;

  // Routes that should NEVER have public Navbar/Footer
  const excludeRoutes = [
    /^\/admin/, // Global admin routes
    /^\/auth/, // Auth routes
  ];
  const isExcludedRoute = excludeRoutes.some((pattern) =>
    pattern.test(pathname)
  );

  // Show Navbar/Footer ONLY for public marketing pages (not tenant routes, not admin routes)
  const shouldShowNavAndFooter = isPublicMarketingPage && !isExcludedRoute;

  return (
    <>
      {shouldShowNavAndFooter && <Navbar />}
      {children}
      {shouldShowNavAndFooter && <Footer />}
    </>
  );
}
