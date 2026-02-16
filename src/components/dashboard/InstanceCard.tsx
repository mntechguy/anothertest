"use client";

import { useState } from "react";
import Link from "next/link";

type Instance = {
  id: string;
  plan: string;
  status: string;
  region: string;
  endpoint: string | null;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  provisioning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pending_verification: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  deprovisioned: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function InstanceCard({ instance }: { instance: Instance }) {
  const [copied, setCopied] = useState(false);

  function copyEndpoint() {
    if (instance.endpoint) {
      navigator.clipboard.writeText(instance.endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Instance</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[instance.status] || statusColors.deprovisioned}`}>
          {instance.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Plan</p>
          <p className="mt-1 text-sm font-semibold capitalize">{instance.plan === "byok" ? "Bring Your Own Key" : "Managed AI"}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Region</p>
          <p className="mt-1 text-sm font-semibold">{instance.region}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Created</p>
          <p className="mt-1 text-sm font-semibold">{new Date(instance.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Instance ID</p>
          <p className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">{instance.id}</p>
        </div>
      </div>

      {instance.endpoint && (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase text-gray-500">Endpoint</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-gray-100 px-3 py-2 font-mono text-sm dark:bg-gray-900">
              {instance.endpoint}
            </code>
            <button
              onClick={copyEndpoint}
              className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/dashboard/settings"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Manage API Key &rarr;
        </Link>
      </div>
    </div>
  );
}
