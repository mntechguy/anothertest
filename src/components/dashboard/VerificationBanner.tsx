"use client";

import { useState } from "react";

export default function VerificationBanner() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function resend() {
    setSending(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setSent(true);
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-900/20">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Please verify your email to activate your instance.
        </p>
        <button
          onClick={resend}
          disabled={sending || sent}
          className="shrink-0 rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-yellow-700 disabled:opacity-60"
        >
          {sent ? "Email sent!" : sending ? "Sending..." : "Resend email"}
        </button>
      </div>
    </div>
  );
}
