import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { suspendInstance } from "@/lib/openclaw";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const instance = await db.instance.findUnique({ where: { userId: id } });
  if (!instance) {
    return NextResponse.json({ error: "No instance found" }, { status: 404 });
  }

  await suspendInstance(instance.id);

  await db.auditLog.create({
    data: {
      userId: id,
      action: "admin.instance.suspended",
      details: `By admin: ${session!.user.email}`,
    },
  });

  return NextResponse.json({ message: "Instance suspended" });
}
