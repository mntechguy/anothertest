import { db } from "@/lib/db";

export default async function AdminOverviewPage() {
  const totalUsers = await db.user.count();
  const activeByok = await db.instance.count({ where: { plan: "byok", status: { not: "deprovisioned" } } });
  const activeManaged = await db.instance.count({ where: { plan: "managed", status: { not: "deprovisioned" } } });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const signupsThisWeek = await db.user.count({ where: { createdAt: { gte: weekAgo } } });

  // MRR estimation: $29 * BYOK + $49 * Managed
  const mrr = activeByok * 29 + activeManaged * 49;

  const recentSignups = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { instance: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          System health and user metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers.toString()} />
        <StatCard label="Active Subscriptions" value={`${activeByok + activeManaged}`} sub={`${activeByok} BYOK / ${activeManaged} Managed`} />
        <StatCard label="MRR" value={`$${mrr.toLocaleString()}`} />
        <StatCard label="Signups (7d)" value={signupsThisWeek.toString()} />
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs font-medium uppercase text-gray-500 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Signed Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentSignups.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-3 font-medium">{user.email}</td>
                  <td className="px-6 py-3 capitalize">{user.instance?.plan || "—"}</td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
                      {user.instance?.status?.replace("_", " ") || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentSignups.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
