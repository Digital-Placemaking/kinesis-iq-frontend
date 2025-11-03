import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
