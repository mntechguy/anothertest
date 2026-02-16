import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import InstanceCard from "@/components/dashboard/InstanceCard";
import StatsPlaceholder from "@/components/dashboard/StatsPlaceholder";
import VerificationBanner from "@/components/dashboard/VerificationBanner";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { instance: true },
  });

  if (!user) redirect("/login");

  const needsVerification = !user.emailVerified;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your OpenClaw instance
        </p>
      </div>

      {needsVerification && <VerificationBanner />}

      {user.instance && (
        <InstanceCard
          instance={{
            id: user.instance.id,
            plan: user.instance.plan,
            status: user.instance.status,
            region: user.instance.region,
            endpoint: user.instance.endpoint,
            createdAt: user.instance.createdAt.toISOString(),
          }}
        />
      )}

      {!user.instance && (
        <div className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No instance found. Complete the signup process to get started.
          </p>
        </div>
      )}

      <StatsPlaceholder />
    </div>
  );
}
