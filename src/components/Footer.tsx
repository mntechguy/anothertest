import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-12 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              Open<span className="text-brand-600">Claw</span>
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              AI infrastructure, managed for you.
            </p>
          </div>

          <div className="flex gap-8 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              Contact
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} OpenClaw. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
