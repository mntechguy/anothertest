"use client";

import { useState, useEffect } from "react";

type BillingData = {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  invoices: { id: string; amount: number; status: string; date: string; url: string | null }[];
};

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing/info")
      .then((r) => r.json())
      .then((data) => setBilling(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Billing</h1></div>
        <div className="animate-pulse rounded-xl border border-gray-200 p-6 dark:border-gray-800">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-4 h-8 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  const planLabel = billing?.plan === "byok" ? "Bring Your Own Key" : "Managed AI";
  const planPrice = billing?.plan === "byok" ? "$29/mo" : "$49/mo + usage";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your subscription and view invoices
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{planLabel}</h2>
            <p className="mt-1 text-2xl font-bold">{planPrice}</p>
            {billing?.status && (
              <p className="mt-2 text-sm capitalize text-gray-500">
                Status: {billing.status.replace("_", " ")}
              </p>
            )}
            {billing?.currentPeriodEnd && (
              <p className="mt-1 text-sm text-gray-500">
                Next billing: {new Date(billing.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900 disabled:opacity-60"
          >
            {portalLoading ? "Opening..." : "Manage Subscription"}
          </button>
        </div>
      </div>

      {billing?.invoices && billing.invoices.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {billing.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium">{new Date(inv.date).toLocaleDateString()}</p>
                  <p className="text-xs capitalize text-gray-500">{inv.status}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold">${(inv.amount / 100).toFixed(2)}</p>
                  {inv.url && (
                    <a href={inv.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:text-brand-700">
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
