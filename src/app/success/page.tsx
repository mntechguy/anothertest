"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        {/* Success checkmark */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold">You&apos;re all set!</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Your OpenClaw instance is being provisioned. You&apos;ll receive a
          confirmation email shortly with your dashboard credentials.
        </p>

        {sessionId && (
          <p className="mt-4 text-xs text-gray-400">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}

        <div className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold">Next steps</h2>

          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                1
              </span>
              <div>
                <div className="text-sm font-medium">Check your email</div>
                <div className="mt-0.5 text-xs text-gray-500">
                  We&apos;ve sent your login credentials and getting started guide.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                2
              </span>
              <div>
                <div className="text-sm font-medium">
                  Configure your API key
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  If you chose BYOK, add your AI provider API key in the
                  dashboard settings.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                3
              </span>
              <div>
                <div className="text-sm font-medium">Start building</div>
                <div className="mt-0.5 text-xs text-gray-500">
                  Use the API endpoints and dashboard to integrate OpenClaw into
                  your application.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Go to Dashboard
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
