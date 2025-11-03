import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <span className="text-lg font-bold">DP</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center gap-6 text-sm">
            <a
              href="#"
              className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Terms of Service
            </a>
          </nav>

          {/* Theme Toggle */}
          <div className="flex items-center justify-end sm:justify-start">
            <ThemeToggle />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Digital Placemaking. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
