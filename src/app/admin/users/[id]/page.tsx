"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type UserDetail = {
  id: string;
  email: string;
  role: string;
  emailVerified: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  instance: {
    id: string;
    plan: string;
    status: string;
    region: string;
    endpoint: string | null;
    createdAt: string;
  } | null;
  auditLogs: { id: string; action: string; details: string | null; createdAt: string }[];
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  function fetchUser() {
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((data) => setUser(data.user || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchUser(); }, [userId]);

  async function handleAction(action: string) {
    if (action === "deprovision" && !confirm("Are you sure you want to deprovision this instance? This cannot be undone.")) {
      return;
    }
    setActionLoading(action);
    try {
      await fetch(`/api/admin/users/${userId}/${action}`, { method: "POST" });
      fetchUser();
    } catch {
      // silently fail
    } finally {
      setActionLoading("");
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <div className="text-gray-500">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
        &larr; Back to users
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{user.email}</h1>
        <p className="mt-1 text-sm text-gray-500">User ID: {user.id}</p>
      </div>

      {/* User Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
          <h2 className="text-lg font-semibold">User Info</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium capitalize">{user.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email Verified</dt>
              <dd className="font-medium">{user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : "No"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Stripe Customer</dt>
              <dd className="font-mono text-xs">{user.stripeCustomerId || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        {/* Instance Info */}
        <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Instance</h2>
          {user.instance ? (
            <>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Plan</dt>
                  <dd className="font-medium capitalize">{user.instance.plan === "byok" ? "BYOK" : "Managed AI"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
                      {user.instance.status.replace("_", " ")}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Region</dt>
                  <dd className="font-medium">{user.instance.region}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Endpoint</dt>
                  <dd className="font-mono text-xs">{user.instance.endpoint || "—"}</dd>
                </div>
              </dl>

              <div className="mt-6 flex gap-3">
                {user.instance.status === "active" && (
                  <button
                    onClick={() => handleAction("suspend")}
                    disabled={!!actionLoading}
                    className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-100 disabled:opacity-60 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  >
                    {actionLoading === "suspend" ? "..." : "Suspend"}
                  </button>
                )}
                {user.instance.status === "suspended" && (
                  <button
                    onClick={() => handleAction("resume")}
                    disabled={!!actionLoading}
                    className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-60 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    {actionLoading === "resume" ? "..." : "Resume"}
                  </button>
                )}
                {user.instance.status !== "deprovisioned" && (
                  <button
                    onClick={() => handleAction("deprovision")}
                    disabled={!!actionLoading}
                    className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                  >
                    {actionLoading === "deprovision" ? "..." : "Deprovision"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No instance</p>
          )}
        </div>
      </div>

      {/* Audit Log */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Audit Log</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {user.auditLogs.length === 0 ? (
            <div className="px-6 py-6 text-center text-sm text-gray-500">No audit entries</div>
          ) : (
            user.auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium">{log.action}</p>
                  {log.details && <p className="text-xs text-gray-500">{log.details}</p>}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
