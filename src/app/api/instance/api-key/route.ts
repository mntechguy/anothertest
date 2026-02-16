import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateApiKey } from "@/lib/openclaw";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { apiKey } = await req.json();
  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const instance = await db.instance.findUnique({
    where: { userId: session.user.id },
  });

  if (!instance) {
    return NextResponse.json({ error: "No instance found" }, { status: 404 });
  }

  if (instance.plan !== "byok") {
    return NextResponse.json({ error: "API key management is only available for BYOK plans" }, { status: 400 });
  }

  const apiKeyHash = await bcrypt.hash(apiKey, 10);
  await updateApiKey(instance.id, apiKeyHash);

  return NextResponse.json({ message: "API key updated" });
}
