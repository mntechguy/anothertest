import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { provisionInstance } from "@/lib/openclaw";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const record = await db.verificationToken.findUnique({
      where: { token },
      include: { user: { include: { instance: true } } },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    if (record.user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    // Mark email as verified
    await db.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await db.verificationToken.delete({ where: { id: record.id } });

    // Start provisioning if instance exists
    if (record.user.instance) {
      await provisionInstance(record.userId, record.user.instance.plan);
      await sendWelcomeEmail(record.user.email, record.user.instance.plan);
    }

    await db.auditLog.create({
      data: { userId: record.userId, action: "email.verified" },
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
