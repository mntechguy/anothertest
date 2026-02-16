import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      instance: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const auditLogs = await db.auditLog.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified?.toISOString() || null,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt.toISOString(),
      instance: user.instance
        ? {
            id: user.instance.id,
            plan: user.instance.plan,
            status: user.instance.status,
            region: user.instance.region,
            endpoint: user.instance.endpoint,
            createdAt: user.instance.createdAt.toISOString(),
          }
        : null,
      auditLogs: auditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        details: l.details,
        createdAt: l.createdAt.toISOString(),
      })),
    },
  });
}
