import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instance = await db.instance.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      plan: true,
      status: true,
      region: true,
      endpoint: true,
      apiKeyHash: true,
      createdAt: true,
    },
  });

  // Mask the API key hash — just indicate whether one exists
  const result = instance
    ? { ...instance, apiKeyHash: instance.apiKeyHash ? "configured" : null }
    : null;

  return NextResponse.json({ instance: result });
}
