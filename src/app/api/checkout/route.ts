import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email, plan } = await req.json();

    if (!email || !plan) {
      return NextResponse.json(
        { error: "Email and plan are required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    // Build line items based on plan
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (plan === "byok") {
      lineItems.push({
        price: process.env.STRIPE_BYOK_PRICE_ID!,
        quantity: 1,
      });
    } else if (plan === "managed") {
      // Base subscription price
      lineItems.push({
        price: process.env.STRIPE_MANAGED_BASE_PRICE_ID!,
        quantity: 1,
      });
      // Metered usage component
      lineItems.push({
        price: process.env.STRIPE_MANAGED_METERED_PRICE_ID!,
      });
    } else {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: lineItems,
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/signup?plan=${plan}`,
      metadata: {
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
