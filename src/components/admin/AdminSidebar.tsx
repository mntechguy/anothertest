"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Open<span className="text-brand-600">Claw</span>
          <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

        <Link
          href="/dashboard"
          className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          &larr; Back to Dashboard
        </Link>
      </nav>

      <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
        <p className="truncate text-sm text-gray-600 dark:text-gray-400">{email}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
