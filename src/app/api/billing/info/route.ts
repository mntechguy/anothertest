import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { instance: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const plan = user.instance?.plan || "unknown";
  let status = "unknown";
  let currentPeriodEnd: string | null = null;
  const invoices: { id: string; amount: number; status: string; date: string; url: string | null }[] = [];

  if (user.stripeCustomerId) {
    try {
      const stripe = getStripe();

      // Get active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        status = sub.status;
        // Use cancel_at or billing_cycle_anchor as period reference
        if (sub.cancel_at) {
          currentPeriodEnd = new Date(sub.cancel_at * 1000).toISOString();
        } else if (sub.items.data[0]?.current_period_end) {
          currentPeriodEnd = new Date((sub.items.data[0] as { current_period_end?: number }).current_period_end! * 1000).toISOString();
        }
      }

      // Get recent invoices
      const stripeInvoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 5,
      });

      for (const inv of stripeInvoices.data) {
        invoices.push({
          id: inv.id,
          amount: inv.amount_due,
          status: inv.status || "unknown",
          date: new Date((inv.created || 0) * 1000).toISOString(),
          url: inv.hosted_invoice_url || null,
        });
      }
    } catch (err) {
      console.error("Error fetching Stripe data:", err);
    }
  }

  return NextResponse.json({ plan, status, currentPeriodEnd, invoices });
}
