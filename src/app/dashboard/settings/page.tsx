"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [instance, setInstance] = useState<{
    plan: string;
    apiKeyHash: string | null;
  } | null>(null);

  // API key form
  const [apiKey, setApiKey] = useState("");
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyMsg, setApiKeyMsg] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    fetch("/api/instance/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.instance) setInstance(data.instance);
      })
      .catch(() => {});
  }, []);

  async function handleApiKeyUpdate(e: React.FormEvent) {
    e.preventDefault();
    setApiKeyMsg("");
    setApiKeyLoading(true);
    try {
      const res = await fetch("/api/instance/api-key", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setApiKeyMsg("API key updated successfully");
        setApiKey("");
        setInstance((prev) => prev ? { ...prev, apiKeyHash: "updated" } : prev);
      } else {
        setApiKeyMsg(data.error || "Failed to update");
      }
    } catch {
      setApiKeyMsg("Something went wrong");
    } finally {
      setApiKeyLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPwMsg(data.error || "Failed to update password");
      }
    } catch {
      setPwMsg("Something went wrong");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your API keys and account settings
        </p>
      </div>

      {/* API Key Section */}
      <section className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="text-lg font-semibold">API Key</h2>
        {instance?.plan === "byok" ? (
          <>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter your AI provider API key (OpenAI, Anthropic, etc.). It will be encrypted at rest.
            </p>
            {instance.apiKeyHash && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                A key is currently configured.
              </p>
            )}
            <form onSubmit={handleApiKeyUpdate} className="mt-4 space-y-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
              />
              {apiKeyMsg && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{apiKeyMsg}</p>
              )}
              <button
                type="submit"
                disabled={apiKeyLoading}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {apiKeyLoading ? "Updating..." : "Update Key"}
              </button>
            </form>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your AI is managed by us — no key needed. We handle all AI provider configuration automatically.
          </p>
        )}
      </section>

      {/* Account Section */}
      <section className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Email</p>
            <p className="mt-1 text-sm">{session?.user?.email}</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h3 className="text-sm font-medium">Change Password</h3>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 8 characters)"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
            />
            {pwMsg && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{pwMsg}</p>
            )}
            <button
              type="submit"
              disabled={pwLoading}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-60"
            >
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
