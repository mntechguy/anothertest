import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const totalUsers = await db.user.count();
  const activeByok = await db.instance.count({ where: { plan: "byok", status: { not: "deprovisioned" } } });
  const activeManaged = await db.instance.count({ where: { plan: "managed", status: { not: "deprovisioned" } } });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const signupsThisWeek = await db.user.count({ where: { createdAt: { gte: weekAgo } } });

  const mrr = activeByok * 29 + activeManaged * 49;

  return NextResponse.json({
    totalUsers,
    activeByok,
    activeManaged,
    signupsThisWeek,
    mrr,
  });
}
