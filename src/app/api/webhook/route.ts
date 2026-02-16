import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { provisionInstance, suspendInstance, deprovisionInstance, resumeInstance } from "@/lib/openclaw";
import { sendWelcomeEmail, sendPaymentFailedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const customerId = session.customer as string | null;

      if (userId) {
        if (customerId) {
          await db.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          });
        }

        const user = await db.user.findUnique({
          where: { id: userId },
          include: { instance: true },
        });

        if (user) {
          if (user.emailVerified && user.instance) {
            await provisionInstance(userId, user.instance.plan);
            await sendWelcomeEmail(user.email, user.instance.plan);
          }

          await db.auditLog.create({
            data: {
              userId,
              action: "checkout.completed",
              details: `Plan: ${plan}, Stripe session: ${session.id}`,
            },
          });
        }
      }

      console.log("Checkout completed:", session.id);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId },
        include: { instance: true },
      });

      if (user?.instance) {
        if (subscription.status === "active" && user.instance.status === "suspended") {
          await resumeInstance(user.instance.id);
        }
      }

      console.log("Subscription updated:", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId },
        include: { instance: true },
      });

      if (user?.instance) {
        await deprovisionInstance(user.instance.id);
      }

      console.log("Subscription cancelled:", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId },
        include: { instance: true },
      });

      if (user) {
        if (user.instance) {
          await suspendInstance(user.instance.id);
        }
        await sendPaymentFailedEmail(user.email);
      }

      console.log("Payment failed:", invoice.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
